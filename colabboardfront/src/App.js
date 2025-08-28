import React from "react";
import "./App.css";
import BoardList from "./components/BoardList";
import RegisterPanel from "./components/RegisterPanel";
import LoginPanel from "./components/LoginPanel";
import NewBoardForm from "./components/NewBoardForm";
import JoinBoardForm from "./components/JoinBoardForm";
import WhiteboardCanvas from "./components/WhiteboardCanvas";
import * as signalR from '@microsoft/signalr';

export default function App() {

  const [connection, setConnection] = React.useState(null);
  const [boards, setBoards] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [authenticated, setAuthenticated] = React.useState(false);
  const [showLoginPanel, setShowLoginPanel] = React.useState(true);
  const [showBoardPanel, setShowBoardPanel] = React.useState(false);
  const [showJoinBoardForm, setShowJoinBoardForm] = React.useState(false);
  const [showBoard, setShowBoard] = React.useState(false);
  const [board, setBoard] = React.useState({
        id: null,
        name: null,
        users: [],
        strokes: [],
        activeUsers: []
      });
  const [showBoardList, setShowBoardList] = React.useState(true);

  const handleDraw = async (stroke) => {
    if (connection) {
      await connection.invoke("SendStroke", stroke);
    }
     /*
     console.log(stroke);
    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ strokes: stroke.points })
    });

    if (!response.ok) {
      console.error("Failed to send stroke");
    }
    else {
      const data = await response.json();
      console.log("Stroke sent successfully:", data);
    }
      */
  };

  const GetActiveUsers = (users) => {
    setBoard(prevBoard => ({
      ...prevBoard,
      activeUsers: users
    }));
  };

  const recognition_test = (response) =>{
    console.log(response);
  }

  async function joinBoard(boardId) {
    const token = localStorage.getItem("jwt_token");

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:8080/whiteboardHub?boardId=${boardId}&username=${user.username}`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

      
      connection.on("ReceiveStroke", onStrokeReceived);
      connection.on("RemoveStrokes", removeStrokes);
      connection.on("GetActiveUsers", GetActiveUsers);
      connection.on("RecognitionTest", recognition_test);

    try{
      await connection.start();
      setConnection(connection);
    } catch (error) {
      console.error("Error starting connection:", error);
    }
  }
  
  const onLeaveCanvas = () => {
    if (connection) {
      connection.stop();
      connection.off("ReceiveStroke", onStrokeReceived);
    }
    setBoard({
      id: null,
      name: null,
      users: [],
      strokes: []
    });
    setShowBoard(false);
    setShowBoardList(true);
  };

   function onStrokeReceived(stroke) {
    setBoard(prevBoard => ({
      ...prevBoard,
      strokes: [...prevBoard.strokes, stroke]
    }));
  }

  const removeStrokes = () => {
    setBoard(prevBoard => ({
      ...prevBoard,
      strokes: []
    }));
  };

  const handleBoardSelect = async (boardId) => {
    await loadboardinfo(boardId);
    await joinBoard(boardId);
    setShowBoard(true);
    setShowBoardList(false);
  }

  const loadboardinfo = async (boardId) => {
    const response = await fetch(`http://localhost:8080/Board/GetBoardById/${boardId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      setBoard({
        id: data.id,
        name: data.name,
        users: data.userNames || [],
        strokes: data.strokes || []
      });
    } else {
      console.error('Failed to load board info');
    }
  }

  const clearBoard = (boardId) => {
    connection.invoke("ClearBoard", boardId);
  };

  const loadboards = async () => {
    const response = await fetch('http://localhost:8080/Board', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      setBoards(data.map(board => ({ Name: board.name, Id: board.id })) || []);
    } else {
      console.error('Failed to load boards');
    }
  }

  const onJoinBoard = (newBoard) => {
    setBoards([...boards, newBoard]);
    setShowJoinBoardForm(false);
  }


  const handleLogout = () => {
    if (connection) {
      connection.stop();
    }
    localStorage.removeItem("jwt-token");
    setUser(null);
    setAuthenticated(false);
  };

  const handleUserLogin = (userData) => {
    setUser({ username: userData.username });
    loadboards();
    setAuthenticated(true);
  };

  const handleUserRegistration = () => {
    setShowLoginPanel(true);
  };

  const onCreateBoard = (newBoard) => {
    setBoards([...boards, newBoard]);
    setShowBoardPanel(false);
    setShowBoardList(true);
  }

  const onDeleteBoard = async (boardId) => {
    setBoards(boards.filter(board => board.Id !== boardId));
  }

  React.useEffect(() => { 
    async function fetchData() {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      const response = await fetch('http://localhost:8080/Auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if(!response.ok) {
        console.error('Failed to authenticate');
        return;
      }

      const data = await response.json();
      setUser({
        username: data.userName
      });
      setAuthenticated(true);
      loadboards();
    }
  }

  fetchData();
  }, []);

  return (
    <div className="app">
       <header className="App-header">
        <h1>ColabBoard</h1>
        {authenticated && user && (
          <div className="user-info">
            <span>{user.username}</span>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 24 }}>
    {authenticated ? (
      <>
      {showJoinBoardForm && <JoinBoardForm onJoin={onJoinBoard} onCancel={() => {setShowJoinBoardForm(false); setShowBoardList(true)}} />}
      {showBoardPanel &&  <NewBoardForm onCreate={onCreateBoard} onCancel={() => {setShowBoardPanel(false); setShowBoardList(true)}} />}
      {showBoardList && <BoardList boards={boards}
        onSelectBoard={handleBoardSelect}
        onCreateBoard={() => {setShowBoardPanel(true); setShowBoardList(false)}}
        onDeleteBoard={onDeleteBoard}
        onJoinBoard={() => {setShowJoinBoardForm(true); setShowBoardList(false);}} />}
      {showBoard && <WhiteboardCanvas 
      ClearStrokes={clearBoard}
      board={board}
      onDraw={handleDraw}
      onLeave={onLeaveCanvas}
      />}
      </>
    ) : (
      showLoginPanel ? (
          <LoginPanel onLogin={handleUserLogin} onSwitchToRegister={() => setShowLoginPanel(false)} />
        ) :(
          <RegisterPanel onRegister={handleUserRegistration} onSwitchToLogin={() => setShowLoginPanel(true)} />
        )
      )
    }
  </main>
  </div>
);
}