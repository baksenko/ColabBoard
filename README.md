# ColabBoard

A real-time collaborative whiteboard application that allows multiple users to draw and interact on shared boards simultaneously.

## Features

- Real-time collaborative drawing using SignalR
- User authentication and authorization
- Create and join multiple boards
- Multi-user support with concurrent editing
- Secure board access management

## Tech Stack

- Frontend: React.js
- Backend: ASP.NET Core
- Real-time Communication: SignalR
- Authentication: JWT (JSON Web Tokens)
- Containerization: Docker

## Prerequisites

- Docker
- Docker Compose
- Modern web browser

## Running with Docker

1. Clone the repository
2. Navigate to the project root directory
3. Run the application using Docker Compose:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

To stop the application:
```bash
docker-compose down
```

## Usage

1. Register/Login to access the application
2. Create a new board or join existing ones
3. Share the board ID with collaborators
4. Draw together in real-time

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
