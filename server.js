const express = require("express");
const { createServer } = require("node:http");
const socketio = require("socket.io");
const { join } = require("path");

const app = express();
const server = createServer(app);
const port = 3000;

app.use(express.static(__dirname));

const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  io.to(socket.id).emit("server_response", "Hello, you are connected!");

  socket.on("offer", ({ offer, to: targetId, from }) => {
    try {
      io.to(targetId).emit("offer", { offer, from });
      console.log(`Sending offer from ${from} to ${targetId}`);
    } catch (e) {
      console.log(`Error sending offer from ${socket.id}: ${e}`);
    }
  });

  socket.on("answer", ({ answer, to: targetId, from }) => {
    try {
      io.to(targetId).emit("answer", { answer, from });
      console.log(`Sending answer from ${from} to ${targetId}`);
    } catch (e) {
      console.log(`Error sending answer from ${socket.id}: ${e}`);
    }
  });

  socket.on("iceCandidate", ({ iceCandidate, to: targetId }) => {
    try {
      io.to(targetId).emit("iceCandidate", { iceCandidate });
      console.log(`Sending ice candidate to ${targetId}`);
    } catch (e) {
      console.log(`Error sending ice candidate from ${socket.id}: ${e}`);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${reason}`);
  });
});

server.listen(port, () => {
  console.log(`server running at port: ${port}`); // usage: localIpAddr:port
});
