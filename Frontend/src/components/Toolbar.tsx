import React from 'react';
import { ToolType } from '../types/whiteboard';
import {
    PiCursor,
    PiSquare,
    PiCircle,
    PiLineSegment,
    PiPencilSimple,
    PiTextT,
    PiEraser
} from 'react-icons/pi';

interface ToolbarProps {
    activeTool: ToolType;
    setTool: (tool: ToolType) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setTool }) => {
    const tools: { id: ToolType; icon: React.ComponentType; label: string }[] = [
        { id: 'selection', icon: PiCursor, label: 'Selection' },
        { id: 'rectangle', icon: PiSquare, label: 'Rectangle' },
        { id: 'ellipse', icon: PiCircle, label: 'Ellipse' },
        { id: 'line', icon: PiLineSegment, label: 'Line' },
        { id: 'pencil', icon: PiPencilSimple, label: 'Pencil' },
        { id: 'text', icon: PiTextT, label: 'Text' },
        { id: 'eraser', icon: PiEraser, label: 'Eraser' },
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            padding: 10,
            background: 'white',
            borderRadius: 8,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 100
        }}>
            {tools.map(tool => (
                <button
                    key={tool.id}
                    onClick={() => setTool(tool.id)}
                    title={tool.label}
                    style={{
                        padding: 8,
                        borderRadius: 4,
                        border: 'none',
                        background: activeTool === tool.id ? '#e0e0ff' : 'transparent',
                        color: activeTool === tool.id ? '#4a47a3' : '#333',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20
                    }}
                >
                    <tool.icon />
                </button>
            ))}
        </div>
    );
}
