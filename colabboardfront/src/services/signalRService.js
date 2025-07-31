import * as signalR from '@microsoft/signalr';

let connection = null;

export function connectToHub(boardId, onStrokeReceived) {
  connection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5000/whiteboardHub?boardId=' + boardId)
    .withAutomaticReconnect()
    .build();

  connection.on('ReceiveStroke', onStrokeReceived);

  return connection.start();
}

export function sendStroke(stroke) {
  if (connection) {
    connection.invoke('SendStroke', stroke);
  }
}

export function disconnect() {
  if (connection) {
    connection.stop();
    connection = null;
  }
} 