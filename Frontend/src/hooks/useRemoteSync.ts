
import { useEffect, useRef, useState } from "react";
import { CreateStrokeDto } from "../api-types";
import { signalRService } from "../services/signalRService";
import { ElementType } from "../types";
import { createElement } from "../utilities";

type UseRemoteSyncProps = {
    boardId: string | undefined;
    username: string;
    elements: ElementType[];
    setElements: (
        action: ElementType[] | ((current: ElementType[]) => ElementType[]),
        overwrite?: boolean
    ) => void;
    action: string;
    isReceivingRef: React.MutableRefObject<boolean>;
};

export const useRemoteSync = ({
    boardId,
    username: localUsername,
    elements,
    setElements,
    action,
    isReceivingRef,
}: UseRemoteSyncProps) => {
    const [remoteCursors, setRemoteCursors] = useState<
        Record<string, { username: string; x: number; y: number }>
    >({});

    const previousElementsRef = useRef<ElementType[]>([]);

    // SignalR Connection & Listeners
    useEffect(() => {
        if (!boardId) return;

        const startSignalR = async () => {
            await signalRService.startConnection(boardId, localUsername);
        };
        startSignalR();

        const onReceiveElement = (stroke: CreateStrokeDto) => {
            try {
                let newElement = JSON.parse(stroke.elementAttributes) as ElementType;
                if (!newElement || !newElement.type) {
                    console.warn("Received invalid element", stroke);
                    return;
                }
                newElement.id = stroke.elementId;

                // Hydrate roughElement
                if (["line", "rectangle", "circle", "arrow"].includes(newElement.type)) {
                    newElement = createElement(
                        newElement.id,
                        newElement.x1,
                        newElement.y1,
                        newElement.x2,
                        newElement.y2,
                        newElement.type,
                        {
                            stroke: newElement.stroke || "#000",
                            strokeWidth: newElement.strokeWidth || 1,
                            fill: newElement.fill || "transparent",
                            fillStyle: newElement.fillStyle || "hachure",
                            opacity: newElement.opacity || 100,
                        }
                    );
                }

                isReceivingRef.current = true;
                setElements((prevElements) => {
                    const index = prevElements.findIndex((e) => e.id === newElement.id);
                    if (index === -1) {
                        return [...prevElements, newElement];
                    } else {
                        const copy = [...prevElements];
                        copy[index] = newElement;
                        return copy;
                    }
                }, true);
                setTimeout(() => {
                    isReceivingRef.current = false;
                }, 0);
            } catch (e) {
                console.error("Error receiving element", e);
            }
        };

        const onRemoveElement = (elementId: string) => {
            setElements(
                (prevElements) => prevElements.filter((e) => e.id !== elementId),
                true
            );
        };

        const onRemoveStrokes = () => {
            setElements([], true);
        };

        const onReceiveCursor = (
            userId: string,
            username: string,
            x: number,
            y: number
        ) => {
            // Filter self by connection ID
            const myId = signalRService.getConnectionId();
            if (myId && userId === myId) return;

            // Filter self by username (fallback)
            if (username && localUsername && username.trim().toLowerCase() === localUsername.trim().toLowerCase()) return;

            setRemoteCursors((prev) => ({
                ...prev,
                [userId]: { username, x, y },
            }));
        };

        const onRemoveCursor = (userId: string) => {
            setRemoteCursors((prev) => {
                const newCursors = { ...prev };
                delete newCursors[userId];
                return newCursors;
            });
        };

        signalRService.on("ReceiveElement", onReceiveElement);
        signalRService.on("RemoveElement", onRemoveElement);
        signalRService.on("RemoveStrokes", onRemoveStrokes);
        signalRService.on("ReceiveCursorPosition", onReceiveCursor);
        signalRService.on("RemoveCursor", onRemoveCursor);

        return () => {
            signalRService.off("ReceiveElement", onReceiveElement);
            signalRService.off("RemoveElement", onRemoveElement);
            signalRService.off("RemoveStrokes", onRemoveStrokes);
            signalRService.off("ReceiveCursorPosition", onReceiveCursor);
            signalRService.off("RemoveCursor", onRemoveCursor);
            signalRService.stopConnection();
        };
    }, [boardId, localUsername, setElements, isReceivingRef]);

    const serializeElement = (element: ElementType) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { cachedImage, roughElement, ...rest } = element;
        return JSON.stringify(rest);
    };

    const broadcastElement = async (element: ElementType) => {
        if (!boardId || isReceivingRef.current) return;

        const dto: CreateStrokeDto = {
            elementId: element.id,
            elementAttributes: serializeElement(element),
            roomId: boardId,
        };
        try {
            await signalRService.sendElement(dto);
        } catch (e) {
            console.error(e);
        }
    };

    const deleteElement = async (elementId: string) => {
        if (!boardId) return;
        try {
            await signalRService.deleteElement(elementId, boardId);
        } catch (e) {
            console.error("Failed to delete element", e);
        }
    };

    // Sync Effect
    useEffect(() => {
        if (isReceivingRef.current) {
            previousElementsRef.current = elements;
            return;
        }

        if (action !== "none") {
            return;
        }

        const prev = previousElementsRef.current;
        const current = elements;

        const prevMap = new Map(prev.map((e) => [e.id, e]));
        const currentMap = new Map(current.map((e) => [e.id, e]));

        current.forEach((el) => {
            const prevEl = prevMap.get(el.id);
            if (!prevEl) {
                broadcastElement(el);
            } else if (serializeElement(el) !== serializeElement(prevEl)) {
                broadcastElement(el);
            }
        });

        prev.forEach((el) => {
            if (!currentMap.has(el.id)) {
                deleteElement(el.id);
            }
        });

        previousElementsRef.current = elements;
    }, [elements, action, boardId, isReceivingRef]);

    const sendCursorPosition = async (x: number, y: number) => {
        if (!boardId) return;
        try {
            await signalRService.sendCursorPosition(boardId, x, y);
        } catch (e) {
            console.error("Failed to send cursor position", e);
        }
    };

    return {
        remoteCursors,
        deleteElement,
        broadcastElement,
        sendCursorPosition
    };
};
