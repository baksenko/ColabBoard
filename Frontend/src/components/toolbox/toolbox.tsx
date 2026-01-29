import React, { useState } from "react";
import "./toolbox-style.css";
import { FiMinus } from "react-icons/fi";

type ToolboxProps = {
    stroke: string;
    setStroke: (color: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    // For future expansion
    fill?: string;
    setFill?: (color: string) => void;
    opacity?: number;
    setOpacity?: (opacity: number) => void;
};

const strokeColors = [
    { value: "#000000", name: "Black" },
    { value: "#e03131", name: "Red" },
    { value: "#2f9e44", name: "Green" },
    { value: "#1971c2", name: "Blue" },
    { value: "#f08c00", name: "Orange" },
    { value: "#fcc419", name: "Yellow" },
    { value: "#9c36b5", name: "Purple" },
];

const backgroundColors = [
    { value: "transparent", name: "Transparent" },
    { value: "#ffc9c9", name: "Red" },
    { value: "#b2f2bb", name: "Green" },
    { value: "#a5d8ff", name: "Blue" },
    { value: "#ffec99", name: "Yellow" },
];

export function Toolbox({ stroke, setStroke, strokeWidth, setStrokeWidth, fill, setFill, opacity, setOpacity }: ToolboxProps) {
    return (
        <div className="toolbox">
            <div className="toolbox-section">
                <span className="toolbox-label">Stroke</span>
                <div className="color-picker">
                    {strokeColors.map((c) => (
                        <div
                            key={c.value}
                            className={`color-swatch ${stroke === c.value ? "selected" : ""}`}
                            style={{ backgroundColor: c.value }}
                            onClick={() => setStroke(c.value)}
                            title={c.name}
                        />
                    ))}
                    <input
                        type="color"
                        value={stroke}
                        onChange={(e) => setStroke(e.target.value)}
                        className="color-input"
                        title="Custom"
                    />
                </div>
            </div>

            {fill !== undefined && setFill && (
                <div className="toolbox-section">
                    <span className="toolbox-label">Background</span>
                    <div className="color-picker">
                        {backgroundColors.map((c) => (
                            <div
                                key={c.value}
                                className={`color-swatch ${fill === c.value ? "selected" : ""}`}
                                style={{ backgroundColor: c.value }}
                                onClick={() => setFill(c.value)}
                                title={c.name}
                            />
                        ))}
                        <input
                            type="color"
                            value={fill === "transparent" ? "#ffffff" : fill}
                            onChange={(e) => setFill(e.target.value)}
                            className="color-input"
                            title="Custom"
                        />
                    </div>
                </div>
            )}

            <div className="toolbox-section">
                <span className="toolbox-label">Stroke Width</span>
                <div className="stroke-width-picker">
                    <button
                        className={`width-btn ${strokeWidth === 1 ? "selected" : ""}`}
                        onClick={() => setStrokeWidth(1)}
                        title="Thin"
                    >
                        <FiMinus size={14} />
                    </button>
                    <button
                        className={`width-btn ${strokeWidth === 5 ? "selected" : ""}`}
                        onClick={() => setStrokeWidth(5)}
                        title="Bold"
                    >
                        <FiMinus size={18} strokeWidth={4} />
                    </button>
                    <button
                        className={`width-btn ${strokeWidth === 10 ? "selected" : ""}`}
                        onClick={() => setStrokeWidth(10)}
                        title="Extra Bold"
                    >
                        <FiMinus size={24} strokeWidth={6} />
                    </button>
                </div>
            </div>

            {/* Placeholder for when we hook up opacity fully */}
            {opacity !== undefined && setOpacity && (
                <div className="toolbox-section">
                    <span className="toolbox-label">Opacity</span>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        value={opacity}
                        onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                        className="opacity-slider"
                    />
                </div>
            )}
        </div>
    );
}
