import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { WhiteboardElement, ToolType, Point } from '../types/whiteboard';
import rough from 'roughjs';
import { getStroke } from 'perfect-freehand';

// Simple UUID generator
const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const getSvgPathFromStroke = (stroke: number[][]) => {
    if (!stroke.length) return "";
    const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
        },
        ["M", ...stroke[0], "Q"]
    );
    d.push("Z");
    return d.join(" ");
};

interface WhiteboardCanvasProps {
    initialElements: WhiteboardElement[];
    onElementCreated: (element: WhiteboardElement) => void;
    width: number;
    height: number;
    activeTool: ToolType;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
    initialElements,
    onElementCreated,
    width,
    height,
    activeTool
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentElement, setCurrentElement] = useState<WhiteboardElement | null>(null);
    const [elements, setElements] = useState<WhiteboardElement[]>(initialElements);

    // For selection/moving
    const [selectedElement, setSelectedElement] = useState<WhiteboardElement | null>(null);
    const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

    useEffect(() => {
        setElements(initialElements);
    }, [initialElements]);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, width, height);

        const rc = rough.canvas(canvas);

        const drawEl = (el: WhiteboardElement) => {
            if (el.isDeleted) return;

            if (el.type === 'pencil' && el.points) {
                const outlinePoints = getStroke(el.points, {
                    size: el.strokeWidth,
                    thinning: 0.5,
                    smoothing: 0.5,
                    streamline: 0.5,
                });
                const pathData = getSvgPathFromStroke(outlinePoints);
                const p2d = new Path2D(pathData);
                ctx.fillStyle = el.color;
                ctx.fill(p2d);
            } else if (el.type === 'rectangle') {
                rc.rectangle(el.x, el.y, el.width!, el.height!, { stroke: el.color, strokeWidth: el.strokeWidth });
            } else if (el.type === 'ellipse') {
                rc.ellipse(el.x + el.width! / 2, el.y + el.height! / 2, el.width!, el.height!, { stroke: el.color, strokeWidth: el.strokeWidth });
            } else if (el.type === 'line') {
                rc.line(el.x, el.y, el.x + el.width!, el.y + el.height!, { stroke: el.color, strokeWidth: el.strokeWidth });
            } else if (el.type === 'text' && el.text) {
                ctx.font = `${el.strokeWidth * 10}px 'Virgil', sans-serif`; // Use Virgil if loaded, else sans
                ctx.fillStyle = el.color;
                ctx.fillText(el.text, el.x, el.y);
            }
        };

        // Draw existing
        elements.forEach(drawEl);

        // Draw current interaction
        if (currentElement) {
            drawEl(currentElement);
        }

        // Highlight selected
        if (selectedElement && !isDrawing) {
            ctx.strokeStyle = '#6965db';
            ctx.lineWidth = 1;
            const pad = 5;
            // Simple bounds approximation
            let bx = selectedElement.x, by = selectedElement.y, bw = 0, bh = 0;
            if (selectedElement.type === 'pencil' && selectedElement.points) {
                // Calculate bounds
                const xs = selectedElement.points.map(p => p.x);
                const ys = selectedElement.points.map(p => p.y);
                bx = Math.min(...xs);
                by = Math.min(...ys);
                bw = Math.max(...xs) - bx;
                bh = Math.max(...ys) - by;
            } else {
                bw = selectedElement.width || 0;
                bh = selectedElement.height || 0;
            }
            ctx.strokeRect(bx - pad, by - pad, bw + pad * 2, bh + pad * 2);
        }

    }, [elements, currentElement, selectedElement, width, height]);

    const getCoords = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const isHit = (el: WhiteboardElement, x: number, y: number) => {
        // Very simple hit testing
        if (el.isDeleted) return false;

        if (el.type === 'pencil' && el.points) {
            // Check distance to any point
            return el.points.some(p => Math.hypot(p.x - x, p.y - y) < 10);
        }
        if (el.type === 'rectangle' || el.type === 'ellipse' || el.type === 'text') {
            const right = el.x + (el.width || 0);
            const bottom = el.y + (el.height || 0);
            // Text approx
            const textBottom = el.type === 'text' ? el.y : bottom;
            const textTop = el.type === 'text' ? el.y - 20 : el.y;

            return x >= el.x && x <= right && y >= (el.type === 'text' ? textTop : el.y) && y <= (el.type === 'text' ? textBottom : bottom);
        }
        if (el.type === 'line') {
            // Distance to line segment logic... simplified
            // just check bounding for now
            const x1 = el.x, y1 = el.y;
            const x2 = el.x + (el.width || 0), y2 = el.y + (el.height || 0);
            return x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1, y2) && y <= Math.max(y1, y2);
        }
        return false;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const { x, y } = getCoords(e);

        if (activeTool === 'selection') {
            // Find clicked element (reverse order for z-index)
            const hit = [...elements].reverse().find(el => isHit(el, x, y));
            if (hit) {
                setSelectedElement(hit);
                setDragOffset({ x: x - hit.x, y: y - hit.y });
                setIsDrawing(true); // Re-use for dragging
            } else {
                setSelectedElement(null);
            }
            return;
        }

        if (activeTool === 'eraser') {
            const hit = [...elements].reverse().find(el => isHit(el, x, y));
            if (hit) {
                // Soft delete or filter
                const updated = { ...hit, isDeleted: true };
                // update both local and parent? Parent simplified for now using broadcast
                setElements(prev => prev.map(el => el.id === hit.id ? updated : el));
                // Notify parent (hacky for delete right now)
                // Ideally we send 'delete' action
            }
            return;
        }

        if (activeTool === 'text') {
            const text = prompt("Enter text:");
            if (text) {
                let width = 0;
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx) {
                    // Match the render font: default strokeWidth is 2, so 20px
                    ctx.font = "20px 'Virgil', sans-serif";
                    width = ctx.measureText(text).width;
                }

                const newEl: WhiteboardElement = {
                    id: generateId(),
                    type: 'text',
                    x, y,
                    text,
                    color: '#000000',
                    strokeWidth: 2,
                    width: width,
                    height: 20
                };

                setElements(prev => [...prev, newEl]);
                onElementCreated(newEl);
            }
            return;
        }

        const newElement: WhiteboardElement = {
            id: generateId(),
            type: activeTool,
            x, y,
            color: '#000000',
            strokeWidth: 2,
            points: activeTool === 'pencil' ? [{ x, y }] : undefined,
            width: 0,
            height: 0
        };

        setCurrentElement(newElement);
        setIsDrawing(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const { x, y } = getCoords(e);

        if (activeTool === 'selection' && selectedElement) {
            const updated = {
                ...selectedElement,
                x: x - dragOffset.x,
                y: y - dragOffset.y
            };
            // Optimistic update
            setElements(prev => prev.map(el => el.id === selectedElement.id ? updated : el));
            setSelectedElement(updated);
            return;
        }

        if (!currentElement) return;

        if (activeTool === 'pencil') {
            setCurrentElement(prev => {
                if (!prev || !prev.points) return null;
                return { ...prev, points: [...prev.points, { x, y }] };
            });
        } else {
            // Shapes
            setCurrentElement(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    width: x - prev.x,
                    height: y - prev.y
                };
            });
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (activeTool === 'selection' && selectedElement) {
            onElementCreated(selectedElement); // Treat move as 'create' (update) for now
            return;
        }

        if (currentElement) {
            setElements(prev => [...prev, currentElement]);
            onElementCreated(currentElement);
            setCurrentElement(null);
        }
    };

    return (
        <div style={{
            width: width,
            height: height,
            overflow: 'hidden',
            background: 'white',
            cursor: activeTool === 'selection' ? 'default' : 'crosshair',
        }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ display: 'block' }}
            />
        </div>
    );
};
