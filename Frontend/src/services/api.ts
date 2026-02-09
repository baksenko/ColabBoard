import axios from 'axios';
import { CreateBoardDto, CreateUserDto, RoomDto, AuthResponseDto } from '../api-types';

export const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const username = localStorage.getItem('username');

                if (!refreshToken || !username) {
                    throw new Error('No refresh token available');
                }

                const formData = new FormData();
                formData.append('username', username);
                formData.append('refreshToken', refreshToken);

                // We need to call axios directly to avoid infinite loop if this fails?
                // Or just use 'api' instance but ensure we don't loop endlessly?
                // Since _retry flag is set, it should be fine.
                // However, the refresh endpoint itself might return 401 if refresh token is invalid.
                // So better to use a bare axios instance or careful logic.
                // Using 'api' is risky if the interceptor logic isn't perfect.
                // Let's use axios.create() temporary instance or just axios.post assuming baseURL.

                const response = await axios.post<AuthResponseDto>(
                    `${API_URL}/Auth/refresh`,
                    formData,
                    // Content-Type multipart/form-data is set automatically with FormData
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('username');
                window.location.href = '/login'; // Redirect to login
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (data: CreateUserDto) => {
        const response = await api.post<AuthResponseDto>('/Auth/login',
            `username=${encodeURIComponent(data.username)}&Password=${encodeURIComponent(data.password)}`,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        if (response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('username', data.username);
        }
        return response.data;
    },
    register: async (data: CreateUserDto) => {
        // CreateUserDto maps to Form Data in backend
        const formData = new FormData();
        formData.append('Username', data.username);
        formData.append('Password', data.password);
        return api.post('/Auth/register', formData);
    },
    validate: async () => {
        return api.get<{ userName: string }>('/Auth');
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
    }
};

export const boardService = {
    getUserBoards: async () => {
        return api.get<RoomDto[]>('/Board');
    },
    createBoard: async (data: CreateBoardDto) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('password', data.password);
        return api.post<RoomDto>('/Board', formData);
    },
    joinBoard: async (roomName: string, password: string) => {
        const formData = new FormData();
        formData.append('roomName', roomName);
        formData.append('password', password);
        return api.post<RoomDto>('/Board/JoinBoard', formData);
    },
    getBoardById: async (boardId: string) => {
        return api.get<RoomDto>(`/Board/GetBoardById/${boardId}`);
    },
    leaveBoard: async (boardId: string) => {
        return api.delete(`/Board/${boardId}`);
    },
    deleteStrokes: async (boardId: string) => {
        return api.delete(`/Board/${boardId}/true`);
    }
};

export default api;



