# Real-time n8n to React Chat Integration

This project now supports real-time messages from n8n (or any external service) to the chat UI using a Node.js/Express backend and WebSocket (socket.io).

## How it works

-  The backend (`server.js`) exposes a POST endpoint `/api/message` for n8n to send messages (text and/or imageUrl).
-  The backend broadcasts these messages to all connected clients via WebSocket.
-  The React app listens for new messages and displays them in the chat UI.

## How to use

1. **Start the backend:**
   ```sh
   node server.js
   ```
2. **Start the React app as usual:**
   ```sh
   npm run dev
   ```
3. **Configure n8n:**
   -  Use the HTTP Request node to POST to `http://<your-server>:4000/api/message` with JSON body:
      ```json
      {
      	"text": "Hello from n8n!",
      	"imageUrl": "https://example.com/image.png", // optional
      	"sessionId": "<session-id>" // optional, for targeting a specific chat
      }
      ```

## Requirements

-  Node.js and npm installed
-  Dependencies installed (`npm install`)

## Customization

-  You can filter messages by sessionId in the backend if needed.
-  The React app will show any message broadcasted by the backend.

---

For further customization or help, see the code in `server.js` and `src/socket.ts`.
