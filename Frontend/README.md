# ColabBoard Frontend

This is the frontend for ColabBoard, built using React + Vite and adapted from NinjaSketch.

## Features

- **Real-time Whiteboard**: Collaborative drawing using `roughjs` and SignalR.
- **Board Management**: Create, Join, and list boards.
- **Authentication**: User login and registration.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build**:
    ```bash
    npm run build
    ```

## API Configuration

The API URL is configured in `src/services/api.ts` (default: `http://localhost:8080`).
SignalR Hub URL is in `src/pages/Board.tsx` (default: `http://localhost:8080/whiteboardHub`).

Ensure the backend API is running before starting the frontend interaction.
