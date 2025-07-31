import React from 'react';

const BoardList = ({ boards, onSelectBoard, onCreateBoard, onDeleteBoard }) => {
  const handleDeleteClick = (e, boardId, boardName) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${boardName}"? This action cannot be undone.`)) {
      onDeleteBoard(boardId);
    }
  };

  return (
    <div className="BoardList">
      <h2>Your Whiteboards</h2>
      
      {boards.length === 0 ? (
        <div className="empty-state">
          <p>No boards created yet.</p>
          <p>Create your first whiteboard to get started!</p>
        </div>
      ) : (
        <div className="boards-container">
          <h3>Available Boards:</h3>
          <ul>
            {boards.map(board => (
              <li key={board.id}>
                <div className="board-item">
                  <button 
                    className="board-button"
                    onClick={() => onSelectBoard(board)}
                  >
                    <strong>{board.name}</strong>
                    {board.password && (
                      <span className="protected-badge">
                        Protected
                      </span>
                    )}
                  </button>
                  <button
                    className="delete-button"
                    onClick={(e) => handleDeleteClick(e, board.id, board.name)}
                    title={`Delete ${board.name}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="create-button-container">
        <button 
          className="create-button"
          onClick={onCreateBoard}
        >
          Create New Board
        </button>
      </div>
    </div>
  );
};

export default BoardList; 