// Socket.io client for React app
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://746b9e134cd3.ngrok-free.app";

let socket: Socket | null = null;

export function getSocket() {
	if (!socket) {
		socket = io(SOCKET_URL, { transports: ["websocket"] });
	}
	return socket;
}
