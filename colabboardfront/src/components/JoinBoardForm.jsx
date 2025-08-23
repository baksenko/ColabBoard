import React, { useState } from "react";
import './JoinBoardForm.css';

export default function JoinBoardForm({ onJoin, onCancel }) {

  const [errors, setErrors] = useState({});
  const [boardName, setBoardName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
        if (boardName.trim() && password.trim()) {
    
          const formDataToSend = new FormData();
          formDataToSend.append('roomName', boardName);
          formDataToSend.append('Password', password);
    
          const response = await fetch('http://localhost:8080/Board/JoinBoard', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            },
            body: formDataToSend
          });
    
          if (response.ok) {
            const data = await response.json();
            const newBoard = {Name: data.name, Id: data.id};
            onJoin(newBoard);
            console.log('New board created:', newBoard);
          }
          else{
            const errortext = await response.text();
            setErrors({general: errortext || "Failed to join board"});
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
          <h2>Join Board</h2>
          
          <form onSubmit={handleSubmit}>
            {errors.general && <p className="error">{errors.general}</p>}
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
            </div>
            
            <div className="submit-container">
              <button 
                type="submit" 
                className="submit-button"
              >
                Join Board
              </button>
            </div>
          </form>
        </div>
      );

}