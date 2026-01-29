
import { useEffect } from "react";
import { ElementType } from "../types";
import { createElement } from "../utilities";

type UseShortcutsProps = {
    undo: () => void;
    redo: () => void;
    action: string;
    elements: ElementType[];
    setElements: (
        action: ElementType[] | ((current: ElementType[]) => ElementType[]),
        overwrite?: boolean
    ) => void;
    selectedElement: ElementType | null;
    setSelectedElement: (el: ElementType | null) => void;
    selectedElements: ElementType[];
    setSelectedElements: (els: ElementType[]) => void;
    deleteElement: (id: string) => void;
    clipboardRef: React.MutableRefObject<ElementType[]>;
    mousePosRef: React.MutableRefObject<{ x: number; y: number }>;
};

// Helper to generate IDs (duplicate from Board.tsx, maybe move to utils if strict)
const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const useShortcuts = ({
    undo,
    redo,
    action,
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    selectedElements,
    setSelectedElements,
    deleteElement,
    clipboardRef,
    mousePosRef,
}: UseShortcutsProps) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore if we are writing (let textarea handle it)
            if (action === "writing") return;

            // Also ignore if any input/textarea is focused (generic safety)
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement
            )
                return;

            if (event.key === "Delete" || event.key === "Backspace") {
                if (selectedElements.length > 0) {
                    const idsToRemove = selectedElements.map((e) => e.id);
                    // Update state
                    setElements(elements.filter((e) => !idsToRemove.includes(e.id)));
                    setSelectedElements([]);
                    setSelectedElement(null);
                    // Broadcast deletes
                    idsToRemove.forEach((id) => deleteElement(id));
                } else if (selectedElement) {
                    // Fallback for single selected element legacy logic
                    setElements(elements.filter((e) => e.id !== selectedElement.id));
                    deleteElement(selectedElement.id);
                    setSelectedElement(null);
                }
            }
            if (event.ctrlKey || event.metaKey) {
                if (event.key === "z") {
                    if (event.shiftKey) redo();
                    else undo();
                } else if (event.key === "y") {
                    redo();
                } else if (event.key === "c") {
                    // Copy
                    if (selectedElements.length > 0) {
                        const serialized = selectedElements.map((el) => {
                            // Strip runtime props
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { cachedImage, roughElement, ...rest } = el;
                            return rest;
                        });
                        const json = JSON.stringify(serialized);
                        clipboardRef.current = JSON.parse(json);
                        // Write to system clipboard to "clear" any previous image and claim precedence
                        navigator.clipboard.writeText(json).catch(err => console.error("Could not write to clipboard", err));
                    }
                } else if (event.key === "v") {
                    // Paste
                    // Always try to read system clipboard first for Images
                    navigator.clipboard.read().then((items) => {
                        let imageFound = false;
                        for (const item of items) {
                            if (item.types && item.types.some(type => type.startsWith('image/'))) {
                                const imageType = item.types.find(type => type.startsWith('image/'));
                                if (imageType) {
                                    imageFound = true;
                                    item.getType(imageType).then((blob) => {
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            const dataURL = e.target?.result as string;
                                            const img = new Image();
                                            img.src = dataURL;
                                            img.onload = () => {
                                                const id = generateId();
                                                const mouseX = mousePosRef.current.x;
                                                const mouseY = mousePosRef.current.y;
                                                const width = img.naturalWidth;
                                                const height = img.naturalHeight;

                                                const newEl = createElement(id, mouseX, mouseY, mouseX + width, mouseY + height, "image", {
                                                    stroke: "#000",
                                                    strokeWidth: 1,
                                                    fill: "transparent",
                                                    fillStyle: "hachure",
                                                    opacity: 100,
                                                    dataURL: dataURL
                                                });
                                                newEl.cachedImage = img;

                                                setElements((prev) => [...prev, newEl]);
                                                setSelectedElements([newEl]);
                                            };
                                        };
                                        reader.readAsDataURL(blob);
                                    });
                                    break; // Only paste first image
                                }
                            }
                        }

                        if (!imageFound) {
                            // Fallback to internal/text logic
                            throw new Error("No image found");
                        }
                    }).catch(() => {
                        // If reading failed or no image found, try internal clipboard
                        if (clipboardRef.current.length > 0) {
                            const mouseX = mousePosRef.current.x;
                            const mouseY = mousePosRef.current.y;

                            // Calculate bounding box of clipboard
                            let minX = Infinity;
                            let minY = Infinity;

                            clipboardRef.current.forEach((el) => {
                                if (el.type === "pencil" && el.points) {
                                    const xs = el.points.map((p: any) => p.x);
                                    const ys = el.points.map((p: any) => p.y);
                                    minX = Math.min(minX, ...xs);
                                    minY = Math.min(minY, ...ys);
                                } else {
                                    const elMinX = Math.min(el.x1, el.x2);
                                    const elMinY = Math.min(el.y1, el.y2);
                                    minX = Math.min(minX, elMinX);
                                    minY = Math.min(minY, elMinY);
                                }
                            });

                            // Calculate offset relative to Mouse Position (place top-left of group at mouse)
                            const deltaX = mouseX - minX;
                            const deltaY = mouseY - minY;

                            const pasted = clipboardRef.current.map((el) => {
                                const id = generateId();
                                let x1 = el.x1;
                                let y1 = el.y1;
                                let x2 = el.x2;
                                let y2 = el.y2;

                                let newEl: ElementType;

                                if (el.type === "pencil" && el.points) {
                                    const newPoints = el.points.map((p: any) => ({
                                        x: p.x + deltaX,
                                        y: p.y + deltaY,
                                    }));
                                    const newXs = newPoints.map((p: any) => p.x);
                                    const newYs = newPoints.map((p: any) => p.y);
                                    x1 = Math.min(...newXs);
                                    y1 = Math.min(...newYs);
                                    x2 = Math.max(...newXs);
                                    y2 = Math.max(...newYs);

                                    newEl = {
                                        ...el,
                                        id,
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        points: newPoints,
                                        roughElement: null,
                                    };
                                } else {
                                    x1 += deltaX;
                                    y1 += deltaY;
                                    x2 += deltaX;
                                    y2 += deltaY;

                                    if (el.type === "image") {
                                        newEl = createElement(id, x1, y1, x2, y2, el.type, {
                                            stroke: el.stroke || "#000",
                                            strokeWidth: el.strokeWidth || 1,
                                            fill: el.fill || "transparent",
                                            fillStyle: el.fillStyle || "hachure",
                                            opacity: el.opacity || 100,
                                            dataURL: el.dataURL,
                                        });
                                        if (el.dataURL) {
                                            const img = new Image();
                                            img.src = el.dataURL;
                                            newEl.cachedImage = img;
                                        }
                                    } else if (
                                        ["line", "rectangle", "circle", "arrow"].includes(el.type)
                                    ) {
                                        newEl = createElement(id, x1, y1, x2, y2, el.type, {
                                            stroke: el.stroke || "#000",
                                            strokeWidth: el.strokeWidth || 1,
                                            fill: el.fill || "transparent",
                                            fillStyle: el.fillStyle || "hachure",
                                            opacity: el.opacity || 100,
                                        });
                                    } else if (el.type === "text") {
                                        newEl = {
                                            ...createElement(id, x1, y1, x2, y2, el.type, {
                                                stroke: el.stroke || "#000",
                                                strokeWidth: el.strokeWidth || 1,
                                                fill: el.fill || "transparent",
                                                fillStyle: el.fillStyle || "hachure",
                                                opacity: el.opacity || 100,
                                            }),
                                            text: el.text,
                                        };
                                    } else {
                                        newEl = { ...el, id, x1, y1, x2, y2 };
                                    }
                                }

                                return newEl;
                            });

                            setElements((prev) => [...prev, ...pasted]);
                            setSelectedElements(pasted);
                        }
                    });
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [
        undo,
        redo,
        selectedElements,
        selectedElement,
        elements,
        deleteElement,
        action,
        setElements,
        setSelectedElements,
        setSelectedElement,
        clipboardRef,
        mousePosRef,
    ]);
};
