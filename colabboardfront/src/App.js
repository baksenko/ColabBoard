import React, { useState, useEffect } from 'react';
import BoardList from './components/BoardList';
import NewBoardForm from './components/NewBoardForm';
import WhiteboardCanvas from './components/WhiteboardCanvas';
import LoginPanel from './components/LoginPanel';
import RegisterPanel from './components/RegisterPanel';
import './App.css';

const COLORS = ['#1d29b5ff', '#e42e2eff', '#17b978', '#ff9d14ff', '#6a4cff', '#fff', '#000'];

function App() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [strokes, setStrokes] = useState([]);
  const [color, setColor] = useState(COLORS[0]);
  const [isErasing, setIsErasing] = useState(false);
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

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

  const handleLogin = (loginData) => {
    // Store user data and token
    setCurrentUser({ 
      username: loginData.username, 
      name: loginData.username,
      token: loginData.token 
    });
    setIsAuthenticated(true);
    setShowLogin(true);
  };

  const handleRegister = (registerData) => {
    // In a real app, you would send this to your backend
    setCurrentUser({ username: registerData.username, name: registerData.username });
    setIsAuthenticated(true);
    setShowLogin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSelectedBoard(null);
    setStrokes([]);
    setBoards([]);
  };

  const switchToRegister = () => {
    setShowLogin(false);
  };

  const switchToLogin = () => {
    setShowLogin(true);
  };

  const handleCancelAuth = () => {
    // For auth forms, we could either close the app or show a message
    // For now, we'll just prevent the cancel action since users need to authenticate
    console.log('Auth cancel clicked - authentication required');
  };

  // Check for existing JWT token on app load
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      // You could validate the token with your backend here
      // For now, we'll assume the token is valid
      setIsAuthenticated(true);
      // You might want to decode the JWT to get user info
      // For now, we'll set a placeholder
      setCurrentUser({ 
        username: 'User', 
        name: 'User',
        token: token 
      });
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>ColabBoard</h1>
        {isAuthenticated && currentUser && (
          <div className="user-info">
            <span>{currentUser.username}</span>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 24 }}>
        {!isAuthenticated ? (
          showLogin ? (
            <LoginPanel 
              onLogin={handleLogin}
              onSwitchToRegister={switchToRegister}
              onCancel={handleCancelAuth}
            />
          ) : (
            <RegisterPanel 
              onRegister={handleRegister}
              onSwitchToLogin={switchToLogin}
              onCancel={handleCancelAuth}
            />
          )
        ) : !selectedBoard && !showNewBoardForm ? (
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
              onCancel={handleCancelNewBoard}
            />
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
