import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Set up a simple route to test if server is running
app.get('/', (req, res) => {
    res.send('UNO Backend is running!');
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Player connected');

    // Send a welcome message to the client
    ws.send(JSON.stringify({ message: 'Welcome to UNO game!' }));

    // Listen for messages from client
    ws.on('message', (message) => {
        console.log('Received:', message.toString());
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Player disconnected');
    });
});

export { server };
