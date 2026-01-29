import axios from 'axios';
import { CreateBoardDto, CreateUserDto, RoomDto } from '../api-types';

export const API_URL = 'http://localhost:8080';

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

export const authService = {
    login: async (data: CreateUserDto) => {
        const response = await api.post<{ token: string }>('/Auth/login',
            `username=${encodeURIComponent(data.username)}&Password=${encodeURIComponent(data.password)}`,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
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



