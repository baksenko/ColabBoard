import React, { useRef, useEffect, useState } from 'react';

const DEFAULT_THICKNESS = 3;
const ERASER_THICKNESS = 24;

function lineIntersects(a, b, c, d, threshold = 8) {

  const minX = Math.min(a.x, b.x) - threshold;
  const maxX = Math.max(a.x, b.x) + threshold;
  const minY = Math.min(a.y, b.y) - threshold;
  const maxY = Math.max(a.y, b.y) + threshold;
  const cIn = c.x >= minX && c.x <= maxX && c.y >= minY && c.y <= maxY;
  const dIn = d.x >= minX && d.x <= maxX && d.y >= minY && d.y <= maxY;
  return cIn || dIn;
}

const WhiteboardCanvas = ({ strokes, onDraw, color = '#2d3a4b', isErasing = false }) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(stroke => {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.thickness;
      ctx.beginPath();
      stroke.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    });

    if (drawing && currentPoints.length > 0) {
      ctx.strokeStyle = isErasing ? '#fff' : color;
      ctx.lineWidth = isErasing ? ERASER_THICKNESS : DEFAULT_THICKNESS;
      ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
      ctx.beginPath();
      currentPoints.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
  }, [strokes, drawing, currentPoints, color, isErasing]);

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (e.clientY - rect.top) * (canvasRef.current.height / rect.height),
    };
  };

  const handleMouseDown = (e) => {
    setDrawing(true);
    setCurrentPoints([getCanvasPos(e)]);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    setCurrentPoints(points => [...points, getCanvasPos(e)]);
  };

  const handleMouseUp = () => {
    if (!drawing || currentPoints.length < 2) {
      setDrawing(false);
      setCurrentPoints([]);
      return;
    }
    if (isErasing) {

      const eraseIds = [];
      for (const stroke of strokes) {
        for (let i = 1; i < stroke.points.length; i++) {
          for (let j = 1; j < currentPoints.length; j++) {
            if (lineIntersects(stroke.points[i-1], stroke.points[i], currentPoints[j-1], currentPoints[j], ERASER_THICKNESS/2)) {
              eraseIds.push(stroke.id);
              break;
            }
          }
          if (eraseIds.includes(stroke.id)) break;
        }
      }
      onDraw(null, eraseIds);
    } else {
      onDraw({
        color,
        thickness: DEFAULT_THICKNESS,
        points: currentPoints,
        id: Date.now(),
      });
    }
    setDrawing(false);
    setCurrentPoints([]);
  };

  const getTouchPos = (touch) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (touch.clientY - rect.top) * (canvasRef.current.height / rect.height),
    };
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setDrawing(true);
    setCurrentPoints([getTouchPos(e.touches[0])]);
  };

  const handleTouchMove = (e) => {
    if (!drawing || e.touches.length !== 1) return;
    setCurrentPoints(points => [...points, getTouchPos(e.touches[0])]);
  };

  const handleTouchEnd = () => {
    if (!drawing || currentPoints.length < 2) {
      setDrawing(false);
      setCurrentPoints([]);
      return;
    }
    if (isErasing) {
      const eraseIds = [];
      for (const stroke of strokes) {
        for (let i = 1; i < stroke.points.length; i++) {
          for (let j = 1; j < currentPoints.length; j++) {
            if (lineIntersects(stroke.points[i-1], stroke.points[i], currentPoints[j-1], currentPoints[j], ERASER_THICKNESS/2)) {
              eraseIds.push(stroke.id);
              break;
            }
          }
          if (eraseIds.includes(stroke.id)) break;
        }
      }
      onDraw(null, eraseIds);
    } else {
      onDraw({
        color,
        thickness: DEFAULT_THICKNESS,
        points: currentPoints,
        id: Date.now(),
      });
    }
    setDrawing(false);
    setCurrentPoints([]);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="whiteboard-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};

export default WhiteboardCanvas; 