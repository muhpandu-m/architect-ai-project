// Simple Express backend for receiving messages from n8n and broadcasting to clients via WebSocket (ESM)
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

app.use(cors());
app.use(bodyParser.json());

// Store connected clients
io.on("connection", (socket) => {
	console.log("Client connected:", socket.id);
	socket.on("disconnect", () => {
		console.log("Client disconnected:", socket.id);
	});
});

// Endpoint for n8n to send messages
app.post("/api/message", (req, res) => {
	const { text, imageUrl, sessionId } = req.body;
	if (!text && !imageUrl) {
		return res.status(400).json({ error: "Missing text or imageUrl" });
	}
	// Broadcast to all clients (optionally filter by sessionId)
	io.emit("new-message", { text, imageUrl, sender: "bot", sessionId });
	res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
