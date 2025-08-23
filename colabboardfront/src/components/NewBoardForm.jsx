import React, { useState } from "react";
import './NewBoardForm.css';

export default function NewBoardForm({onCreate, onCancel}) {

  const [errors, setErrors] = useState({});
  const [boardName, setBoardName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (boardName.trim() && password.trim()) {

      const formDataToSend = new FormData();
      formDataToSend.append('Name', boardName);
      formDataToSend.append('Password', password);

      const response = await fetch('http://localhost:8080/Board/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        const newBoard = {Name: data.name, Id: data.id};
        onCreate(newBoard);
        console.log('New board created:', newBoard);
      } else {
        const errortext = await response.text();
        setErrors({general: errortext || "unlucky"});
      }

      setBoardName("");
      setPassword("");
    }
  };

  return (
    <div className="NewBoardForm">
      <button 
        className="cancel-button-x" 
        onClick={onCancel}
        type="button"
        aria-label="Close form"
      >
        ×
      </button>
      <h2>Create New Whiteboard</h2>
      
      <form onSubmit={handleSubmit}>
        {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
        )}
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