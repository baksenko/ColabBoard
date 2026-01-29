import * as signalR from "@microsoft/signalr";
import { CreateStrokeDto } from "../api-types";
import { API_URL } from "./api";

// Helper type for event callbacks
type EventCallback = (...args: any[]) => void;

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private callbacks: { [key: string]: EventCallback[] } = {};

    constructor() {
        this.connection = null;
    }

    public async startConnection(boardId: string, username: string) {
        // Stop existing connection if it exists
        if (this.connection) {
            await this.stopConnection();
        }

        const token = localStorage.getItem('token');

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/whiteboardHub?boardId=${boardId}&username=${username}`, {
                accessTokenFactory: () => token || ''
            })
            .withAutomaticReconnect()
            .build();

        // Register server-to-client event handlers
        this.connection.on("ReceiveElement", (element: CreateStrokeDto) => {
            this.trigger("ReceiveElement", element);
        });

        this.connection.on("RemoveElement", (elementId: string) => {
            this.trigger("RemoveElement", elementId);
        });

        this.connection.on("RemoveStrokes", () => {
            this.trigger("RemoveStrokes");
        });

        this.connection.on("GetActiveUsers", (users: string[]) => {
            console.log("Active users updated:", users);
            this.trigger("GetActiveUsers", users);
        });

        this.connection.on("ReceiveCursorPosition", (userId: string, username: string, x: number, y: number) => {
            this.trigger("ReceiveCursorPosition", userId, username, x, y);
        });

        this.connection.on("RemoveCursor", (userId: string) => {
            this.trigger("RemoveCursor", userId);
        });

        try {
            await this.connection.start();
            console.log("SignalR Connected to board:", boardId);
        } catch (err) {
            console.error("SignalR Connection Failed: ", err);
            // Optionally throw or handle reconnection logic if strict availability is needed
        }
    }

    public async stopConnection() {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
            console.log("SignalR Connection stopped.");
        }
    }

    // Client-to-server methods

    public async sendElement(element: CreateStrokeDto) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke("SendElement", element);
            } catch (err) {
                console.error("Error sending element:", err);
            }
        }
    }

    public async deleteElement(elementId: string, roomId: string) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke("DeleteElement", elementId, roomId);
            } catch (err) {
                console.error("Error deleting element:", err);
            }
        }
    }

    public async clearBoard(boardId: string) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                // boardId is Guid in C#, passing string UUID works
                await this.connection.invoke("ClearBoard", boardId);
            } catch (err) {
                console.error("Error clearing board:", err);
            }
        }
    }

    public async sendCursorPosition(boardId: string, x: number, y: number) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke("SendCursorPosition", boardId, x, y);
            } catch (err) {
                // console.error("Error sending cursor:", err); // Suppress log for performance
            }
        }
    }

    public getConnectionId(): string | null {
        return this.connection?.connectionId || null;
    }

    // Event subscription management

    public on(event: string, callback: EventCallback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }

    public off(event: string, callback: EventCallback) {
        if (this.callbacks[event]) {
            this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
        }
    }

    private trigger(event: string, ...args: any[]) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(...args));
        }
    }
}

export const signalRService = new SignalRService();
