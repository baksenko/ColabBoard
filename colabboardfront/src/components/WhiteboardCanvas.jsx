import React, { useRef, useEffect, useState } from 'react';
import './WhiteboardCanvas.css';

const DEFAULT_THICKNESS = 3;
const ERASER_THICKNESS = 24;

const COLORS = ['#1d29b5ff', '#e42e2eff', '#17b978', '#ff9d14ff', '#6a4cff', '#000'];

const WhiteboardCanvas = ({ClearStrokes, board, onDraw, onLeave }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const [color, setColor] = useState(COLORS[0]);
  const [isErasing, setIsErasing] = useState(false);
  const [size, setSize] = useState(DEFAULT_THICKNESS);
  const [currentStroke, setCurrentStroke] = useState([]);

  const endDraw = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    ctxRef.current.closePath();

    ctxRef.current.globalCompositeOperation = 'source-over';
    
    if (currentStroke.length > 0) {
      console.log({ points: currentStroke, color, size, isErasing, room_id: board.id });
      onDraw && onDraw({ points: currentStroke, color, size, isErasing, roomid: board.id });
      setCurrentStroke([]);
    }
      
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
  }, []);


  useEffect(() => {
  if (!ctxRef.current) return;

  const canvas = canvasRef.current;
  const ctx = ctxRef.current;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  board.strokes.forEach(stroke => {
    const pts = (stroke.points || []).slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (pts.length < 2) return;

    ctx.beginPath();
    ctx.lineWidth = stroke.isErasing ? ERASER_THICKNESS : stroke.size;
    ctx.strokeStyle = stroke.isErasing ? "#fff" : stroke.color;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.globalCompositeOperation = stroke.isErasing ? 'destination-out' : 'source-over';

    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.closePath();
  });

  ctx.globalCompositeOperation = 'source-over';
}, [board.strokes]);


  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDraw = (pos) => {
    drawingRef.current = true;
    lastPointRef.current = pos;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x, pos.y);
    setCurrentStroke([{ x: pos.x, y: pos.y }]);
  };

  const draw = (pos) => {
    if (!drawingRef.current) return;
    ctxRef.current.lineWidth = isErasing ? ERASER_THICKNESS : size;
    ctxRef.current.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    ctxRef.current.strokeStyle = color;
    ctxRef.current.lineTo(pos.x, pos.y);
    ctxRef.current.stroke();
    lastPointRef.current = pos;
    setCurrentStroke(prev => [...prev, { x: pos.x, y: pos.y }]);
  };

  const clearAll = () => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ClearStrokes(board.id);
  };

  const handleMouseDown = (e) => startDraw(getPos(e));
  const handleMouseMove = (e) => draw(getPos(e));
  const handleMouseUp = () => endDraw();

  const handleTouchStart = (e) => startDraw(getPos(e));
  const handleTouchMove = (e) => draw(getPos(e));
  const handleTouchEnd = () => endDraw();

  return (
    <>
      <div className="WhiteboardContainer">
        <button className="back-button" onClick={onLeave}>Back to Boards</button>
        <div className="controls">
          <span className="color-label">Color:</span>
          {COLORS.map(c => (
            <button
              key={c}
              className={`color-button ${color === c ? 'active' : ''}`}
              style={{ '--color': c }}
              onClick={() => { setColor(c); setIsErasing(false); }}
              aria-label={`Pick color ${c}`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => { setColor(e.target.value); setIsErasing(false); }}
            aria-label="Custom color picker"
          />
          <button
            className={`eraser-button ${isErasing ? 'active' : ''}`}
            onClick={() => setIsErasing(e => !e)}
          >
            {isErasing ? 'Erasing' : 'Eraser'}
          </button>
          <input
            type="range"
            min={1}
            max={60}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
          <button onClick={clearAll} className="clear-button">Clear All</button>
        </div>

        <canvas
          ref={canvasRef}
          width={1000}
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
      </div>
      <ul>
        {board.users.map((user, idx) => (
          <li key={idx} className="user-item">
            <span className="user-name">{user}</span>
          </li>
        ))}
      </ul>
    </>
  );
};

export default WhiteboardCanvas;
