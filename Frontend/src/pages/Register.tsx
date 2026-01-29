
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import {
    Button, Typography, TextField, Box, Alert
} from '@mui/material';
import './Auth.css';

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authService.register({ username, password });
            // Auto login after register
            await authService.login({ username, password });
            navigate('/');
        } catch (err) {
            setError('Registration failed. Username might be taken.');
            console.error(err);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left register-bg">
                    <Typography variant="h3" fontWeight="bold" color="white" gutterBottom>
                        Join Us!
                    </Typography>
                    <Typography variant="h6" color="rgba(255,255,255,0.8)">
                        Create an account to start collaborating and sharing your ideas.
                    </Typography>
                </div>
                <div className="auth-right">
                    <div className="auth-form-wrapper">
                        <Typography variant="h4" fontWeight="600" gutterBottom color="primary">
                            Create Account
                        </Typography>
                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: '2rem' }}>
                            Get started with your free account today.
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <form onSubmit={handleRegister}>
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
                                Sign Up
                            </Button>
                        </form>

                        <Box mt={3} textAlign="center">
                            <Typography variant="body2" color="textSecondary">
                                Already have an account?{' '}
                                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                                    Login here
                                </Link>
                            </Typography>
                        </Box>
                    </div>
                </div>
            </div>
        </div>
    );
}
