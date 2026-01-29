
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import {
    Button, Typography, TextField, Box, Alert
} from '@mui/material';
import './Auth.css';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authService.login({ username, password });
            navigate('/');
        } catch (err) {
            setError('Invalid username or password');
            console.error(err);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left">
                    <Typography variant="h3" fontWeight="bold" color="white" gutterBottom>
                        Welcome Back!
                    </Typography>
                    <Typography variant="h6" color="rgba(255,255,255,0.8)">
                        Reconnect with your workspace and continue your creative flow.
                    </Typography>
                </div>
                <div className="auth-right">
                    <div className="auth-form-wrapper">
                        <Typography variant="h4" fontWeight="600" gutterBottom color="primary">
                            Login
                        </Typography>
                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: '2rem' }}>
                            Sign in to access your boards.
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <form onSubmit={handleLogin}>
                            <TextField
                                label="Username"
                                fullWidth
                                margin="normal"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                variant="outlined"
                                className="custom-field"
                            />
                            <TextField
                                label="Password"
                                type="password"
                                fullWidth
                                margin="normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                variant="outlined"
                                className="custom-field"
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                style={{
                                    marginTop: '24px',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600
                                }}
                            >
                                Sign In
                            </Button>
                        </form>

                        <Box mt={3} textAlign="center">
                            <Typography variant="body2" color="textSecondary">
                                Don't have an account?{' '}
                                <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                                    Register here
                                </Link>
                            </Typography>
                        </Box>
                    </div>
                </div>
            </div>
        </div>
    );
}
