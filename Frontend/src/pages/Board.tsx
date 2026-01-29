import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from 'react-router-dom';
import rough from "roughjs";

import { ActionBar, ControlPanel, Info, Toolbox } from "../components";
import { useHistory } from "../hooks/useHistory";
import { usePressedKeys } from "../hooks/usePressedKeys";
import { useRemoteSync } from "../hooks/useRemoteSync";
import { useShortcuts } from "../hooks/useShortcuts";
import { boardService } from '../services/api';
import {
  ActionsType,
  ElementType,
  ExtendedElementType,
  Tools,
  ToolsType,
} from "../types";
import {
  adjustElementCoordinates,
  adjustmentRequired,
  createElement,
  cursorForPosition,
  drawElement,
  getElementAtPosition,
  resizedCoordinates,
} from "../utilities";
import { StrokeDto } from '../api-types';

const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function Board() {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const [connection, setConnection] = useState<HubConnection | null>(null); // Removed local state

  /* State Declarations */
  const { elements, setElements, undo, redo } = useHistory([]);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [startPanMousePosition, setStartPanMousePosition] = useState({ x: 0, y: 0 });
  const [action, setAction] = useState<ActionsType>("none");
  const [tool, setTool] = useState<ToolsType>(Tools.selection);
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
  const [selectedElements, setSelectedElements] = useState<ElementType[]>([]); // Added
  const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null); // Added
  const [selectionEnd, setSelectionEnd] = useState<{ x: number, y: number } | null>(null); // Added
  const [scale, setScale] = useState(1);
  const [scaleOffset, setScaleOffset] = useState({ x: 0, y: 0 });
  const [stroke, setStroke] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [fill, setFill] = useState("transparent");
  const [opacity, setOpacity] = useState(100);
  const [username] = useState(localStorage.getItem('username') || 'Guest');
  // remoteCursors is now managed by the hook
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const pressedKeys = usePressedKeys();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previousElementsRef = useRef<ElementType[]>([]); // To track changes for sync

  const clipboardRef = useRef<ElementType[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const historyEntryCreated = useRef(false);
  const dragStartSnapshotRef = useRef<ExtendedElementType[]>([]);
  const dragStartPosRef = useRef({ x: 0, y: 0 }); // Added for transient move tracking
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); // Added for transient move rendering
  const lastCursorSend = useRef(0);

  const isReceivingRef = useRef(false);

  // Load Board
  useEffect(() => {
    if (!boardId) return;
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const loadBoard = async () => {
      try {
        isReceivingRef.current = true;
        const res = await boardService.getBoardById(boardId);
        const loadedStrokes = res.data.strokes || [];
        const parsedElements: ElementType[] = [];
        loadedStrokes.forEach((s: StrokeDto) => {
          try {
            const elem = JSON.parse(s.elementAttributes) as ElementType;
            if (elem && elem.type && elem.x1 !== undefined && elem.y1 !== undefined) {
              elem.id = s.elementId;
              // Hydrate roughElement for shapes that need it
              if (["line", "rectangle", "circle", "arrow"].includes(elem.type)) {
                const hydrated = createElement(elem.id, elem.x1, elem.y1, elem.x2, elem.y2, elem.type, {
                  stroke: elem.stroke || "#000",
                  strokeWidth: elem.strokeWidth || 1,
                  fill: elem.fill || "transparent",
                  fillStyle: elem.fillStyle || "hachure",
                  opacity: elem.opacity || 100
                });
                parsedElements.push(hydrated);
              } else {
                parsedElements.push(elem);
              }
            } else {
              console.warn("Skipping invalid element", elem);
            }
          } catch (e) {
            console.warn('Skipping incompatible stroke', s);
          }
        });
        setElements(parsedElements, true);
        previousElementsRef.current = parsedElements; // Initialize ref
        setTimeout(() => { isReceivingRef.current = false; }, 100);
      } catch (err: any) {
        console.error("Failed to load board", err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/login');
        }
      }
    };
    loadBoard();
  }, [boardId, navigate, setElements]);

  // --- Custom Hooks ---

  // Handle SignalR, Remote Cursors, and State Synchronization
  const { remoteCursors, deleteElement, broadcastElement, sendCursorPosition } = useRemoteSync({
    boardId,
    username,
    elements,
    setElements,
    action,
    isReceivingRef
  });

  // Handle Keyboard Shortcuts (Undo, Redo, Copy, Paste, Delete)
  useShortcuts({
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
    mousePosRef
  });

  // --------------------


  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const roughCanvas = rough.canvas(canvas);

    context.clearRect(0, 0, canvas.width, canvas.height);

    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;
    const scaleOffsetX = (scaledWidth - canvas.width) / 2;
    const scaleOffsetY = (scaledHeight - canvas.height) / 2;
    setScaleOffset({ x: scaleOffsetX, y: scaleOffsetY });

    context.save();
    context.translate(
      panOffset.x * scale - scaleOffsetX,
      panOffset.y * scale - scaleOffsetY
    );
    context.scale(scale, scale);

    elements.forEach((element) => {
      // Check if this element is being moved
      const isDragging = action === "moving" && selectedElements.some(el => el.id === element.id);

      // Don't draw selected elements if we are expecting to draw them specially?
      // No, we always draw them. But maybe we draw a bounding box around them if selected.
      if (
        action === "writing" &&
        selectedElement &&
        selectedElement.id === element.id
      )
        return;

      context.save();
      if (isDragging) {
        context.translate(dragOffset.x, dragOffset.y);
      }

      drawElement(roughCanvas, context, element);

      // Draw highlight for selected elements
      if (selectedElements.some(el => el.id === element.id) && action !== "drawing") {
        context.save();
        const padding = 5;

        // If dragging, the highlight is drawn relative to the translated context, so it moves with the element!

        if (element.type === "pencil" && element.points) {
          // Calculate bounds for pencil
          const xs = element.points.map(p => p.x);
          const ys = element.points.map(p => p.y);
          const minX = Math.min(...xs) - padding;
          const minY = Math.min(...ys) - padding;
          const maxX = Math.max(...xs) + padding;
          const maxY = Math.max(...ys) + padding;
          context.strokeStyle = "#4da6ff";
          context.lineWidth = 1;
          context.strokeRect(minX, minY, maxX - minX, maxY - minY);
        } else {
          context.strokeStyle = "#4da6ff";
          context.lineWidth = 1;
          context.strokeRect(element.x1 - padding, element.y1 - padding, (element.x2 - element.x1) + padding * 2, (element.y2 - element.y1) + padding * 2);
        }
        context.restore();
      }
      context.restore();
    });

    // Draw selection box
    if (action === "selecting" && selectionStart && selectionEnd) {
      context.save();
      const width = selectionEnd.x - selectionStart.x;
      const height = selectionEnd.y - selectionStart.y;

      const isCrossing = width < 0;

      if (isCrossing) {
        context.strokeStyle = "green";
        context.fillStyle = "rgba(0, 255, 0, 0.1)";
        context.setLineDash([5, 5]);
      } else {
        context.strokeStyle = "#007fff";
        context.fillStyle = "rgba(0, 127, 255, 0.1)";
        context.setLineDash([]);
      }

      context.lineWidth = 1;
      context.beginPath();
      context.rect(selectionStart.x, selectionStart.y, width, height);
      context.fill();
      context.stroke();
      context.restore();
      context.restore();
    }



    context.restore();
  }, [elements, action, selectedElement, selectedElements, panOffset, scale, selectionStart, selectionEnd, dragOffset]);

  useEffect(() => {
    const panOrZoomFunction = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault(); // Prevent browser zoom
        onZoom(event.deltaY * -0.001);
      } else {
        setPanOffset((prevState) => ({
          x: prevState.x - event.deltaX,
          y: prevState.y - event.deltaY,
        }));
      }
    };
    document.addEventListener("wheel", panOrZoomFunction, { passive: false });
    return () => { document.removeEventListener("wheel", panOrZoomFunction); };
  }, [pressedKeys]);

  const updateElement = (
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: ToolsType,
    options?: { text?: string }
  ) => {
    const elementsCopy = [...elements];
    const index = elementsCopy.findIndex(el => el.id === id);
    if (index === -1) return;

    switch (type) {
      case Tools.line:
      case Tools.rectangle:
      case Tools.circle:
      case Tools.arrow: {
        elementsCopy[index] = createElement(id, x1, y1, x2, y2, type, { stroke, strokeWidth, fill, fillStyle: "hachure", opacity });
        break;
      }
      case Tools.pencil: {
        const existingPoints = elementsCopy[index].points || [];
        elementsCopy[index].points = [...existingPoints, { x: x2, y: y2 }];
        elementsCopy[index].stroke = stroke; // Ensure we keep formatting if it wasn't there, but usually it's set on creation
        elementsCopy[index].strokeWidth = strokeWidth;
        break;
      }
      case Tools.text: {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Canvas element not found");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not get 2D context from canvas");
        if (!options || !options.text) throw new Error("No text options provided for text tool");
        const textWidth = context.measureText(options.text).width;
        const textHeight = 24;
        elementsCopy[index] = {
          ...createElement(id, x1, y1, x1 + textWidth, y1 + textHeight, type, { stroke, strokeWidth, fill, fillStyle: "hachure", opacity }),
          text: options.text,
        };
        break;
      }
      default:
        throw new Error(`Type not recognised: ${type}`);
    }
    setElements(elementsCopy, true);
  };

  const getMouseCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { clientX: 0, clientY: 0 }; // Should not happen
    const rect = canvas.getBoundingClientRect();
    const clientX = (event.clientX - rect.left - panOffset.x * scale + scaleOffset.x) / scale;
    const clientY = (event.clientY - rect.top - panOffset.y * scale + scaleOffset.y) / scale;
    return { clientX, clientY };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (action === "writing") return;
    const { clientX, clientY } = getMouseCoordinates(event);

    if (tool === Tools.pan || event.button === 1 || pressedKeys.has(" ")) {
      setAction("panning");
      setStartPanMousePosition({ x: clientX, y: clientY });
      document.body.style.cursor = "grabbing";
      return;
    }

    if (tool === Tools.eraser) {
      const element = getElementAtPosition(clientX, clientY, [...elements].reverse());
      if (element) {
        setElements(elements.filter(e => e.id !== element.id));
        deleteElement(element.id);
      }
      setAction("erasing"); // Set action for drag-to-erase
      return;
    }

    if (tool === Tools.selection) {
      const element = getElementAtPosition(clientX, clientY, [...elements].reverse());
      if (element) {
        if (event.shiftKey) {
          const alreadySelectedIndex = selectedElements.findIndex(e => e.id === element.id);
          if (alreadySelectedIndex > -1) {
            const newSelected = selectedElements.filter((_, i) => i !== alreadySelectedIndex);
            setSelectedElements(newSelected);
            setSelectedElement(newSelected.length > 0 ? newSelected[newSelected.length - 1] : null);
            setAction("none");
          } else {
            const newBatch = [...selectedElements, element];
            const updatedSelection = newBatch.map(el => {
              const selEl: any = { ...el };
              if (el.type === "pencil" && el.points) {
                selEl.xOffsets = el.points.map((p: any) => clientX - p.x);
                selEl.yOffsets = el.points.map((p: any) => clientY - p.y);
              } else {
                selEl.offsetX = clientX - el.x1;
                selEl.offsetY = clientY - el.y1;
              }
              return selEl;
            });
            setSelectedElements(updatedSelection);
            dragStartSnapshotRef.current = updatedSelection;
            dragStartPosRef.current = { x: clientX, y: clientY };
            setDragOffset({ x: 0, y: 0 });
            setSelectedElement(element);
            setAction("moving");
            historyEntryCreated.current = false; // Reset for new move
          }
          return;
        }

        const isSelected = selectedElements.some(e => e.id === element.id);

        if (!isSelected) {
          const selectedEl = { ...element };
          if (element.type === "pencil" && element.points) {
            const xOffsets = element.points.map((point) => clientX - point.x);
            const yOffsets = element.points.map((point) => clientY - point.y);
            (selectedEl as any).xOffsets = xOffsets;
            (selectedEl as any).yOffsets = yOffsets;
          } else {
            (selectedEl as any).offsetX = clientX - element.x1;
            (selectedEl as any).offsetY = clientY - element.y1;
          }
          setSelectedElements([selectedEl]);
          dragStartSnapshotRef.current = [selectedEl];
          dragStartPosRef.current = { x: clientX, y: clientY };
          setDragOffset({ x: 0, y: 0 });
          setSelectedElement(selectedEl);
        } else {
          // Already selected: preparing to move/resize THE GROUP
          // Re-calculate offsets for ALL selected elements relative to mouse
          const updatedSelection = selectedElements.map(el => {
            const newEl = { ...el };
            if (el.type === "pencil" && el.points) {
              const xOffsets = el.points.map((point) => clientX - point.x);
              const yOffsets = el.points.map((point) => clientY - point.y);
              (newEl as any).xOffsets = xOffsets;
              (newEl as any).yOffsets = yOffsets;
            } else {
              (newEl as any).offsetX = clientX - el.x1;
              (newEl as any).offsetY = clientY - el.y1;
            }
            return newEl;
          });
          setSelectedElements(updatedSelection);
          dragStartSnapshotRef.current = updatedSelection;
          dragStartPosRef.current = { x: clientX, y: clientY };
          setDragOffset({ x: 0, y: 0 });
          setSelectedElement(updatedSelection.find(e => e.id === element.id) || updatedSelection[0]);
        }

        if (element.position === "inside") {
          setAction("moving");
          historyEntryCreated.current = false; // Reset
        } else {
          setAction("resizing");
          historyEntryCreated.current = false; // Reset
        }
      } else {
        // Clicked on empty space within selection tool -> Start Box Selection
        setAction("selecting");
        setSelectionStart({ x: clientX, y: clientY });
        setSelectedElements([]);
        setSelectedElement(null);
      }
    } else {
      const id = generateId();
      const newElement = createElement(id, clientX, clientY, clientX, clientY, tool, { stroke, strokeWidth, fill, fillStyle: "hachure", opacity });
      setElements((prevState) => [...prevState, newElement]);

      if (tool === Tools.text) {
        setSelectedElement(newElement);
        setSelectedElements([newElement]);
        dragStartSnapshotRef.current = [newElement];
        setAction("writing");
      } else {
        setSelectedElement(null);
        setSelectedElements([]);
        setAction("drawing");
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = getMouseCoordinates(event);
    mousePosRef.current = { x: clientX, y: clientY };

    // Broadcast cursor position (Throttle to ~50ms)
    const now = Date.now();
    if (boardId && now - lastCursorSend.current > 50) {
      lastCursorSend.current = now;
      // We need to send "raw" coordinates relative to board content?
      // Let's send the coordinates as they are (clientX, clientY) which are relative to the board origin (0,0) with applied zoom/pan?
      // Wait, getMouseCoordinates returns coordinates corrected for zoom and pan. So they are absolute "world" coordinates.
      // Yes, so all clients can render them correctly regardless of their own zoom/pan.
      sendCursorPosition(clientX, clientY);
    }

    if (action === "panning") {
      const deltaX = clientX - startPanMousePosition.x;
      const deltaY = clientY - startPanMousePosition.y;
      setPanOffset({ x: panOffset.x + deltaX, y: panOffset.y + deltaY });
      return;
    }

    if (action === "selecting") {
      setSelectionEnd({ x: clientX, y: clientY });
      return;
    }

    if (tool === Tools.selection) {
      const element = getElementAtPosition(clientX, clientY, [...elements].reverse());
      const target = event.target as HTMLElement;
      if (element && element.position) {
        target.style.cursor = cursorForPosition(element.position);
      } else {
        target.style.cursor = "default";
      }
    }

    if (action === "drawing") {
      const index = elements.length - 1;
      const element = elements[index];
      if (element) {
        const { x1, y1 } = element;
        updateElement(element.id, x1, y1, clientX, clientY, tool);
      }
    } else if (action === "moving") {
      const dx = clientX - dragStartPosRef.current.x;
      const dy = clientY - dragStartPosRef.current.y;
      setDragOffset({ x: dx, y: dy });
      // We do NOT update elements state here for performance. UseLayoutEffect handles translation.

    } else if (action === "erasing") {
      const element = getElementAtPosition(clientX, clientY, [...elements].reverse());
      if (element) {
        setElements(elements.filter(e => e.id !== element.id));
        deleteElement(element.id);
      }
    } else if (action === "resizing" && dragStartSnapshotRef.current.length === 1) {
      // Only resize single element for now
      const selectedSnapshot = dragStartSnapshotRef.current[0];
      const { id, type, position, ...coordinates } = selectedSnapshot;
      const { x1, y1, x2, y2 } = resizedCoordinates(clientX, clientY, position as string, coordinates);
      updateElement(id, x1, y1, x2, y2, type);
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = getMouseCoordinates(event);

    if (action === "selecting" && selectionStart) {
      // Selection box complete. Find intersecting elements.
      const isCrossing = clientX < selectionStart.x;

      const x1 = Math.min(selectionStart.x, clientX);
      const y1 = Math.min(selectionStart.y, clientY);
      const x2 = Math.max(selectionStart.x, clientX);
      const y2 = Math.max(selectionStart.y, clientY);

      const found = elements.filter(el => {
        let elMinX, elMaxX, elMinY, elMaxY;

        if (el.type === Tools.pencil && el.points) {
          const xs = el.points.map(p => p.x);
          const ys = el.points.map(p => p.y);
          elMinX = Math.min(...xs);
          elMaxX = Math.max(...xs);
          elMinY = Math.min(...ys);
          elMaxY = Math.max(...ys);
        } else {
          elMinX = Math.min(el.x1, el.x2);
          elMaxX = Math.max(el.x1, el.x2);
          elMinY = Math.min(el.y1, el.y2);
          elMaxY = Math.max(el.y1, el.y2);
        }

        const isOverlapping = !(elMinX > x2 || elMaxX < x1 || elMinY > y2 || elMaxY < y1);
        const isContained = elMinX >= x1 && elMaxX <= x2 && elMinY >= y1 && elMaxY <= y2;

        return isCrossing ? isOverlapping : isContained;
      });
      setSelectedElements(found);
      setSelectedElement(found.length > 0 ? found[0] : null); // Primary selection
      setSelectionStart(null);
      setSelectionEnd(null);
      setAction("none");
      return;
    }

    if (selectedElements.length > 0) {
      // Finalize move for all
      if (action === "moving") {
        const elementsCopy = [...elements];
        const dx = dragOffset.x;
        const dy = dragOffset.y;

        dragStartSnapshotRef.current.forEach(selectedEl => {
          const index = elementsCopy.findIndex(el => el.id === selectedEl.id);
          if (index === -1) return;

          const originalEl = elementsCopy[index];

          if (originalEl.type === "pencil" && "points" in originalEl) {
            const newPoints = originalEl.points!.map(p => ({ x: p.x + dx, y: p.y + dy }));
            elementsCopy[index] = { ...originalEl, points: newPoints };
          } else {
            const { x1, y1, x2, y2 } = originalEl;
            const newX1 = x1 + dx;
            const newY1 = y1 + dy;
            const newX2 = x2 + dx;
            const newY2 = y2 + dy;

            // We call updateElement / createElement logic here if needed, or just patch coordinates
            // To ensure consistency, let's just create new element
            const opts = {
              stroke: originalEl.stroke!,
              strokeWidth: originalEl.strokeWidth!,
              fill: originalEl.fill!,
              fillStyle: originalEl.fillStyle!,
              opacity: originalEl.opacity!,
              dataURL: originalEl.dataURL,
              cachedImage: originalEl.cachedImage
            };

            elementsCopy[index] = {
              ...createElement(originalEl.id, newX1, newY1, newX2, newY2, originalEl.type, opts),
              text: originalEl.text,
            };
          }
        });

        setElements(elementsCopy, true); // Commit final change
        setDragOffset({ x: 0, y: 0 }); // Reset
      }
      else if (action === "resizing" && selectedElement) {
        // Resize single
        const index = elements.findIndex(e => e.id === selectedElement.id);
        const latestElement = elements[index];
        if (latestElement && adjustmentRequired(latestElement.type)) {
          const { x1, y1, x2, y2 } = adjustElementCoordinates(latestElement);
          updateElement(latestElement.id, x1, y1, x2, y2, latestElement.type);
          const updated = elements.find(e => e.id === latestElement.id);
          if (updated) broadcastElement(updated);
        }
      }

      /*
      // Logic for entering writing mode moved to double click
      */
    }

    if (action === "writing") return;
    if (action === "panning") document.body.style.cursor = "default";
    // Ensure we don't leave stale selection state if we were doing something else like drawing
    // Ensure we don't leave stale selection state if we were doing something else like drawing
    if (action === "drawing") {
      const index = elements.length - 1;
      const element = elements[index];
      if (adjustmentRequired(element.type)) {
        const { x1, y1, x2, y2 } = adjustElementCoordinates(element);
        updateElement(element.id, x1, y1, x2, y2, element.type);
      }
      setSelectedElements([]);
    }
    setAction("none");
    setSelectedElement(null);
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = getMouseCoordinates(event);
    const element = getElementAtPosition(clientX, clientY, [...elements].reverse());
    if (element && element.type === "text") {
      setSelectedElements([element]);
      setSelectedElement(element);
      setAction("writing");
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    if (selectedElement) {
      const { id, x1, y1, type } = selectedElement;
      const x2 = selectedElement.x2 || x1;
      const y2 = selectedElement.y2 || y1;
      setAction("none");
      setSelectedElement(null);

      updateElement(id, x1, y1, x2, y2, type, { text: event.target.value });

      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        const text = event.target.value;
        const textWidth = context?.measureText(text).width || 0;
        const textHeight = 24;
        const updatedEl = { ...selectedElement, text, x2: x1 + textWidth, y2: y1 + textHeight };
        updatedEl.id = id;
        broadcastElement(updatedEl);
      }
    }
  };

  const onZoom = (delta: number) => {
    setScale((prevState) => Math.min(Math.max(prevState + delta, 0.1), 20));
  };


  return (
    <div>
      <div style={{ position: "fixed", top: 10, left: 10, zIndex: 2 }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: "12px 24px",
            backgroundColor: "var(--primary-bg-color)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            boxShadow: "0 2px 4px 0 rgba(0,0,0,0.1)",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "16px"
          }}
        >
          Home
        </button>
      </div>

      <Info />
      <ActionBar tool={tool} setTool={setTool} />
      {(tool === Tools.rectangle ||
        tool === Tools.line ||
        tool === Tools.pencil ||
        tool === Tools.text ||
        tool === Tools.circle ||
        tool === Tools.arrow) && (
          <Toolbox
            stroke={stroke}
            setStroke={setStroke}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
            fill={fill}
            setFill={setFill}
            opacity={opacity}
            setOpacity={setOpacity}
          />
        )}
      <ControlPanel
        undo={undo}
        redo={redo}
        onZoom={onZoom}
        scale={scale}
        setScale={setScale}
      />

      {action === "writing" ? (
        <textarea
          ref={textAreaRef}
          onBlur={handleBlur}
          className="textArea"
          style={{
            position: 'fixed',
            top: selectedElement
              ? (selectedElement.y1 - 2) * scale +
              panOffset.y * scale -
              scaleOffset.y
              : 0,
            left: selectedElement
              ? selectedElement.x1 * scale + panOffset.x * scale - scaleOffset.x
              : 0,
            font: `${24 * scale}px sans-serif`,
            margin: 0,
            padding: 0,
            border: 0,
            outline: 0,
            resize: "none",
            overflow: "hidden",
            whiteSpace: "pre",
            background: "transparent",
            zIndex: 2,
          }}
        />
      ) : null}
      {/* Remote Cursors Layer */}
      {Object.entries(remoteCursors)
        .filter(([_, cursor]) => cursor.username.trim().toLowerCase() !== username.toLowerCase()) // Filter out own cursor
        .map(([userId, cursor]) => (
          <div
            key={userId}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translate(${cursor.x * scale + panOffset.x * scale - scaleOffset.x}px, ${cursor.y * scale + panOffset.y * scale - scaleOffset.y}px)`,
              pointerEvents: 'none',
              zIndex: 10,
              transition: 'transform 0.1s linear'
            }}
          >
            {/* Cursor Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.4))" }} // Drop shadow for visibility
            >
              <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19135L11.4818 12.3673H5.65376Z" fill="#ff0000" stroke="white" />
            </svg>
            {/* Nickname Label */}
            <div
              style={{
                backgroundColor: "#ff0000",
                color: "white",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "12px",
                marginTop: "4px",
                whiteSpace: "nowrap",
              }}
            >
              {cursor.username}
            </div>
          </div>
        ))}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{
          position: "absolute",
          zIndex: 1,
          touchAction: "none",
          cursor: action === "panning" ? "grabbing" : (tool === Tools.pan || pressedKeys.has(" ") ? "grab" : "default")
        }}
      />
    </div>
  );
}
