const express = require("express");
const { createServer } = require("node:http");
const socketio = require("socket.io");

const app = express();
const server = createServer(app);
const port = 3000;

app.use(express.static(__dirname));

const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

let users = [];

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.emit("server_response", "Hello, you are connected!");

  socket.on("add_user", (userId) => {
    const existingUserIndex = users.findIndex((user) => user.userId === userId);
    if (existingUserIndex === -1) {
      users.push({ userId, socketId: socket.id, status: "Online" });
      console.log("Users", users);
      io.emit("get_user", users);
    } else {
      users[existingUserIndex].socketId = socket.id;
      users[existingUserIndex].status = "Online";
      console.log(`User ${userId} updated with new socket id`);
      console.log("Users", users);
      io.emit("get_user", users);
    }
  });

  socket.on("send_offer", ({ offer, to: targetId, from }) => {
    io.to(targetId).emit("receive_offer", { offer, from });
    console.log(`Sending offer from ${from} to ${targetId}`);
  });

  socket.on("send_answer", ({ answer, to: targetId, from }) => {
    io.to(targetId).emit("receive_answer", { answer, from });
    console.log(`Sending answer from ${from} to ${targetId}`);
  });

  socket.on("send_ice_candidate", ({ iceCandidate, to: targetId }) => {
    io.to(targetId).emit("receive_ice_candidate", iceCandidate);
    console.log(`Sending ice candidate to ${targetId}`);
  });

  socket.on("send_message", ({ from, to: targetId, message }) => {
    let updatedTargetId = users.find((user) => user.userId === targetId);

    io.to(updatedTargetId.socketId).emit("receive_message", { from: from, message, targetId: targetId });
    console.log(`${from} sending message to ${targetId}: ${message}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${reason}`);
    // let updatedUser = users.filter((user) => user.socketId !== socket.id);
    let updatedUser = users.findIndex((user) => user.socketId === socket.id);
    if (updatedUser !== -1) {
      users[updatedUser].status = "Offline";
    }
    console.log("Users", users);
    io.emit("get_user", users);
  });
});

server.listen(port, () => {
  console.log(`server running at http://192.168.1.12:${port}`);
});
