/* eslint-disable no-console */
import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-user", (userId) => {
      socket.join(`user:${userId}`);
    });


    socket.on("join-support", (sessionId) => {
      socket.join(`support:${sessionId}`);
    });

    socket.on("send-message", ({ toUserId, message }) => {
      io.to(`user:${toUserId}`).emit("receive-message", message);
    });

    socket.on("call-offer", ({ sessionId, offer }) => {
      socket.to(`support:${sessionId}`).emit("call-offer", offer);
    });

    socket.on("call-answer", ({ sessionId, answer }) => {
      socket.to(`support:${sessionId}`).emit("call-answer", answer);
    });

    socket.on("ice-candidate", ({ sessionId, candidate }) => {
      socket.to(`support:${sessionId}`).emit("ice-candidate", candidate);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};