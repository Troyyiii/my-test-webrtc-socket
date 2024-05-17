const fs = require("fs");
const https = require("https");
// const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { join } = require("node:path");

const app = express();
app.use(express.static(__dirname));

const key = fs.readFileSync("cert.key");
const cert = fs.readFileSync("cert.crt");

const exprssServer = https.createServer({ key, cert }, app);
// const exprssServer = http.createServer(app);
const io = socketio(exprssServer, {
  cors: {
    origin: ["https://localhost"],
    methods: ["GET", "POST"],
  },
});

exprssServer.listen(3000, () => {
  console.log("Server running at https://localhost:3000");
});

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  // console.log("a user connected");
  // socket.on("disconnect", () => {
  //   console.log("user disconnected");
  // });
  // socket.on("message", (msg) => {
  //   io.emit("message", msg);
  //   console.log("message: " + msg);
  // });

  console.log("User connected");

  socket.on("offer", ({ offer, to: targetId, from }) => {
    console.log(`offer: ${offer} \n to: ${targetId} \n from: ${from}`);
    socket.to(targetId).emit("offer", { offer, from });
  });

  socket.on("answer", ({ answer, to: targetId, from }) => {
    console.log(`answer: ${answer} \n to: ${targetId} \n from: ${from}`);
    socket.to(targetId).emit("answer", { answer, from });
  });

  socket.on("ice candidate", ({ iceCandidate, to: targetId }) => {
    console.log(`candidate: ${iceCandidate} \n to: ${targetId}`);
    socket.to(targetId).emit("ice candidate", iceCandidate);
  });
});

// const express = require("express");
// const { createServer } = require("node:http");
// const { join } = require("node:path");
// const { Server } = require("socket.io");

// const app = express();
// const server = createServer(app);
// const io = new Server(server);

// app.get("/", (req, res) => {
//   res.sendFile(join(__dirname, "index.html"));
// });

// // io.on("connection", (socket) => {
// //   const username = socket.handshake.query.username;

// //   console.log(username + " connected");

// //   socket.on("sendmessage", (data) => {
// //     const message = {
// //       messageListId: data.messageListId,
// //       messageId: data.messageId,
// //       time: data.time,
// //       text: data.text,
// //       sender: data.sender,
// //     };
// //     console.log(message);

// //     socket.emit("receivemessage", message);
// //   });

// //   socket.on("disconnect", () => {
// //     console.log(username + " disconnected");
// //   });
// // });

// io.on("connection", (socket) => {
//   console.log("User connected");

//   socket.on("sendoffer", ({ offer, to: targetId, from }) => {
//     console.log(offer: ${offer} \n to: ${targetId} \n from: ${from});
//     socket.to(targetId).emit("receiveoffer", { offer, from });
//   });

//   socket.on("sendanswer", ({ answer, to: targetId, from }) => {
//     console.log(answer: ${answer} \n to: ${targetId} \n from: ${from});
//     socket.to(targetId).emit("receiveanswer", { answer, from });
//   });

//   socket.on("icecandidate", ({ iceCandidate, to: targetId }) => {
//     console.log(candidate: ${iceCandidate} \n to: ${targetId});
//     socket.to(targetId).emit("icecandidate", iceCandidate);
//   });
// });

// server.listen(3000, () => {
//   console.log("server running at http://localhost:3000");
// });
