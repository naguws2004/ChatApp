const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');

app.use(cors());

const io = require('socket.io')(http, {
  cors: {
      origin: "http://localhost:3000"
  }
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('chat message', (msg) => {
    console.log('message:', msg);
    io.emit('chat message', msg); // Broadcast message to all connected clients
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

http.listen(7000, () => {
  console.log('listening on *:7000');
});