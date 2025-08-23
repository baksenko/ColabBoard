import React from 'react';
import './BoardList.css';

export default function BoardList({ boards, onSelectBoard, onCreateBoard, onDeleteBoard, onJoinBoard }) {

  const handleDeleteClick = async (e, boardId, boardName) => {
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete "${boardName}"? This action cannot be undone.`))
      {
        console.log(`Deleting board with ID: ${boardId}`);
      const response = await fetch(`http://localhost:8080/Board/${boardId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      },
    });

    if (response.ok) {
      console.log(`Board with ID ${boardId} deleted`);
    } else {
      console.error('Failed to delete board');
    }
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
              <li key={board.Id}>
                <div className="board-item">
                  <button 
                    className="board-button"
                    onClick={() => onSelectBoard(board.Id)}
                  >
                    <strong>{board.Name}</strong>
                    {board.password && (
                      <span className="protected-badge">
                        Protected
                      </span>
                    )}
                  </button>
                  <button
                    className="delete-button"
                    onClick={(e) => handleDeleteClick(e, board.Id, board.Name)}
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
        <button 
          className="join-board-button"
          onClick={onJoinBoard}
        >
          Join Board
        </button>
      </div>
    </div>
  );
}