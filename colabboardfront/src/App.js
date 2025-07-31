import React, { useState } from 'react';
import BoardList from './components/BoardList';
import NewBoardForm from './components/NewBoardForm';
import WhiteboardCanvas from './components/WhiteboardCanvas';
import './App.css';

const COLORS = ['#1d29b5ff', '#e42e2eff', '#17b978', '#ff9d14ff', '#6a4cff', '#fff', '#000'];

function App() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [strokes, setStrokes] = useState([]);
  const [color, setColor] = useState(COLORS[0]);
  const [isErasing, setIsErasing] = useState(false);
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);

  const handleSelectBoard = (board) => {
    setSelectedBoard(board);
    setStrokes([]);
  };

  const handleCreateBoard = () => {
    setShowNewBoardForm(true);
  };

  const handleNewBoardSubmit = (boardData) => {
    const newBoard = {
      id: Date.now().toString(),
      name: boardData.boardName,
      password: boardData.password,
    };
    setBoards([...boards, newBoard]);
    setSelectedBoard(newBoard);
    setStrokes([]);
    setShowNewBoardForm(false);
  };

  const handleCancelNewBoard = () => {
    setShowNewBoardForm(false);
  };

  const handleDeleteBoard = (boardId) => {
    setBoards(boards.filter(board => board.id !== boardId));
    if (selectedBoard && selectedBoard.id === boardId) {
      setSelectedBoard(null);
      setStrokes([]);
    }
  };

  const handleDraw = (stroke, eraseIds) => {
    if (isErasing && eraseIds && eraseIds.length > 0) {
      setStrokes(strokes.filter(s => !eraseIds.includes(s.id)));
    } else if (!isErasing && stroke) {
      setStrokes([...strokes, stroke]);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ColabBoard</h1>
      </header>
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 24 }}>
        {!selectedBoard && !showNewBoardForm ? (
          <BoardList
            boards={boards}
            onSelectBoard={handleSelectBoard}
            onCreateBoard={handleCreateBoard}
            onDeleteBoard={handleDeleteBoard}
          />
        ) : showNewBoardForm ? (
          <div style={{ width: '100%', maxWidth: 600 }}>
            <NewBoardForm 
              onCreate={handleNewBoardSubmit}
            />
            <div className="cancel-container">
              <button 
                className="cancel-button"
                onClick={handleCancelNewBoard}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="WhiteboardContainer">
            <button className="back-button" onClick={() => setSelectedBoard(null)}>Back to Boards</button>
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
              <button
                className={`eraser-button ${isErasing ? 'active' : ''}`}
                onClick={() => setIsErasing(e => !e)}
              >
                {isErasing ? 'Erasing' : 'Eraser'}
              </button>
            </div>
            <WhiteboardCanvas
              strokes={strokes}
              onDraw={handleDraw}
              color={color}
              isErasing={isErasing}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
