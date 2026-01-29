export type Point = { x: number; y: number };

export type ToolType = 'selection' | 'rectangle' | 'ellipse' | 'line' | 'pencil' | 'text' | 'eraser';

export type WhiteboardElement = {
    id: string;
    type: ToolType;
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: Point[]; // For pencil
    text?: string;    // For text
    color: string;
    strokeWidth: number;
    isDeleted?: boolean;
};
