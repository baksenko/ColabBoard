import React, { useState } from "react";

const NewBoardForm = ({ onCreate }) => {
  const [boardName, setBoardName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (boardName.trim() && password.trim()) {
      onCreate({ boardName, password });
      setBoardName("");
      setPassword("");
    }
  };

  return (
    <div className="NewBoardForm">
      <h2>Create New Whiteboard</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Board Name:
          </label>
          <input
            type="text"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            required
            placeholder="Enter board name"
          />
        </div>
        
        <div className="form-group">
          <label>
            Room Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
          />
          <small className="help-text">
            This password will protect your whiteboard from unauthorized access.
          </small>
        </div>
        
        <div className="submit-container">
          <button 
            type="submit" 
            className="submit-button"
          >
            Create Board
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBoardForm;