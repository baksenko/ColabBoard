import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, boardService } from '../services/api';
import { RoomDto } from '../api-types';
import {
    Button, Container, Typography, TextField, Box,
    Grid, Dialog, DialogTitle,
    DialogContent, DialogActions, AppBar, Toolbar
} from '@mui/material';
import { FiPlus, FiLogIn, FiLogOut, FiLayout, FiUsers } from 'react-icons/fi';
import './Home.css';
import '../components/info/info-style.css'; // Reusing global styles if any, or just for consistency

export default function Home() {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [boards, setBoards] = useState<RoomDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [openCreate, setOpenCreate] = useState(false);
    const [openJoin, setOpenJoin] = useState(false);
    const [boardName, setBoardName] = useState('');
    const [boardPassword, setBoardPassword] = useState('');

    useEffect(() => {
        if (token) {
            loadBoards();
            authService.validate().catch(() => {
                handleLogout();
            });
        } else {
            // Redirect if no token immediately, though PrivateRoute handles this usually
            navigate('/login');
        }
    }, [token]);

    const loadBoards = async () => {
        setLoading(true);
        try {
            const res = await boardService.getUserBoards();
            setBoards(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        setToken(null);
        setBoards([]);
        navigate('/login');
    };

    const handleCreateBoard = async () => {
        if (!boardName.trim()) return;
        try {
            const res = await boardService.createBoard({ name: boardName, password: boardPassword });
            setOpenCreate(false);
            setBoardName('');
            setBoardPassword('');
            navigate(`/board/${res.data.id}`);
        } catch (error) {
            alert('Failed to create board');
            console.error(error);
        }
    };

    const handleJoinBoard = async () => {
        if (!boardName.trim()) return;
        try {
            const res = await boardService.joinBoard(boardName, boardPassword);
            setOpenJoin(false);
            setBoardName('');
            setBoardPassword('');
            navigate(`/board/${res.data.id}`);
        } catch (error) {
            alert('Failed to join board');
            console.error(error);
        }
    };

    const enterBoard = (id: string) => {
        navigate(`/board/${id}`);
    };

    // Cast Grid to any to avoid current typescript issue with 'item' prop if it persists, 
    // though typically modern MUI Grid works fine. Keeping legacy cast just in case.
    const GridItem = Grid as any;

    return (
        <div className="home-page">
            {/* Navbar */}
            <AppBar position="sticky" elevation={0} className="home-navbar">
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <FiLayout size={24} style={{ marginRight: '10px', color: 'var(--primary)' }} />
                        <Typography variant="h5" className="brand-logo" style={{ flexGrow: 1 }}>
                            ColabBoard
                        </Typography>

                        <Button
                            color="inherit"
                            onClick={handleLogout}
                            startIcon={<FiLogOut />}
                            style={{ fontWeight: 500, color: '#666' }}
                        >
                            Logout
                        </Button>
                    </Toolbar>
                </Container>
            </AppBar>

            <Container maxWidth="lg">
                {/* Hero / Welcome */}
                <Box className="welcome-section">
                    <Typography variant="h3" className="welcome-title">
                        Welcome to your Workspace
                    </Typography>
                    <Typography variant="body1" className="welcome-subtitle">
                        Create, collaborate, and bring your ideas to life. Select a board below or start a fresh one.
                    </Typography>
                </Box>

                {/* Control Bar */}
                <Box className="control-bar">
                    <Typography variant="h5" className="section-title">
                        Your Boards
                    </Typography>
                    <Box display="flex" gap={2}>
                        <Button
                            variant="outlined"
                            className="btn-secondary"
                            startIcon={<FiLogIn />}
                            onClick={() => setOpenJoin(true)}
                        >
                            Join Board
                        </Button>
                        <Button
                            variant="contained"
                            className="btn-primary"
                            startIcon={<FiPlus />}
                            onClick={() => setOpenCreate(true)}
                        >
                            Create Board
                        </Button>
                    </Box>
                </Box>

                {/* Content Area */}
                {!loading && boards.length === 0 ? (
                    <Box className="empty-state">
                        <FiLayout className="empty-icon" />
                        <Typography variant="h5" gutterBottom color="textPrimary" fontWeight="600">
                            No boards yet
                        </Typography>
                        <Typography className="empty-text">
                            You haven't created or joined any boards yet. <br />
                            Get started by creating your first creative space!
                        </Typography>
                        <Button
                            variant="contained"
                            className="btn-primary"
                            size="large"
                            startIcon={<FiPlus />}
                            onClick={() => setOpenCreate(true)}
                        >
                            Create New Board
                        </Button>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {boards.map((board) => (
                            <GridItem item xs={12} sm={6} md={4} key={board.id}>
                                <div className="board-card" onClick={() => enterBoard(board.id)}>
                                    <div className="board-card-content">
                                        <div className="board-icon-placeholder">
                                            {board.name.charAt(0).toUpperCase()}
                                        </div>
                                        <Typography variant="h6" className="board-title">
                                            {board.name}
                                        </Typography>
                                        <div className="board-meta">
                                            <FiUsers size={14} />
                                            <span>{board.userNames?.length || 0} collaborators</span>
                                        </div>
                                    </div>
                                    <div className="board-card-actions">
                                        <Button
                                            size="small"
                                            className="btn-card"
                                            endIcon={<FiLayout size={14} />}
                                        >
                                            Open Board
                                        </Button>
                                    </div>
                                </div>
                            </GridItem>
                        ))}
                    </Grid>
                )}

                {/* Create Dialog */}
                <Dialog
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    className="custom-dialog"
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle className="dialog-title">Create New Board</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: '20px' }}>
                            Give your new board a catchy name and secure it with a password if needed.
                        </Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Board Name"
                            fullWidth
                            variant="outlined"
                            className="custom-field"
                            value={boardName}
                            onChange={(e) => setBoardName(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="Password (Optional)"
                            type="password"
                            fullWidth
                            variant="outlined"
                            className="custom-field"
                            value={boardPassword}
                            onChange={(e) => setBoardPassword(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions style={{ padding: '24px' }}>
                        <Button onClick={() => setOpenCreate(false)} style={{ color: '#666' }}>Cancel</Button>
                        <Button onClick={handleCreateBoard} variant="contained" className="btn-primary">Create Board</Button>
                    </DialogActions>
                </Dialog>

                {/* Join Dialog */}
                <Dialog
                    open={openJoin}
                    onClose={() => setOpenJoin(false)}
                    className="custom-dialog"
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle className="dialog-title">Join Existing Board</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: '20px' }}>
                            Enter the name and password of the board you want to access.
                        </Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Board Name"
                            fullWidth
                            variant="outlined"
                            className="custom-field"
                            value={boardName}
                            onChange={(e) => setBoardName(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="Password"
                            type="password"
                            fullWidth
                            variant="outlined"
                            className="custom-field"
                            value={boardPassword}
                            onChange={(e) => setBoardPassword(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions style={{ padding: '24px' }}>
                        <Button onClick={() => setOpenJoin(false)} style={{ color: '#666' }}>Cancel</Button>
                        <Button onClick={handleJoinBoard} variant="contained" className="btn-primary">Join Board</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );
}
