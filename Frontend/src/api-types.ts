export interface UserDto {
    username: string;
    token?: string;
}

export interface CreateUserDto {
    username: string;
    password: string;
}

export interface CreateBoardDto {
    name: string;
    password: string;
}

export interface StrokeDto {
    elementId: string;
    elementAttributes: string; // JSON string containing ExcalidrawElement
}

export interface RoomDto {
    id: string; // Guid
    name: string;
    userNames: string[];
    strokes: StrokeDto[];
}

export interface CreateStrokeDto {
    elementId: string;
    elementAttributes: string;
    roomId: string;
}
