/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Server } from "socket.io";
import { firebaseAdmin } from "./firebase";
import { prisma } from "./prisma";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) return next(new Error("Unauthorized"));

      const decoded = await firebaseAdmin.auth().verifyIdToken(token);

      const user = await prisma.user.findUnique({
        where: { firebaseUid: decoded.uid },
      });

      if (!user) return next(new Error("User not found"));

      (socket as any).user = user;

      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;

    console.log("User connected:", user.id);

    socket.join(`user:${user.id}`);

    socket.on("join-conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on(
      "send-message",
      async ({ conversationId, message }) => {
        const newMessage = await prisma.message.create({
          data: {
            text: message,
            senderId: user.id,
            conversationId,
          },
          include: {
            sender: true,
          },
        });

        io.to(`conversation:${conversationId}`).emit(
          "receive-message",
          newMessage
        );
      }
    );

    socket.on("join-support", (sessionId: string) => {
      socket.join(`support:${sessionId}`);
    });

    socket.on("call-offer", ({ sessionId, offer }) => {
      socket.to(`support:${sessionId}`).emit("call-offer", offer);
    });

    socket.on("call-answer", ({ sessionId, answer }) => {
      socket.to(`support:${sessionId}`).emit("call-answer", answer);
    });

    socket.on("ice-candidate", ({ sessionId, candidate }) => {
      socket
        .to(`support:${sessionId}`)
        .emit("ice-candidate", candidate);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", user.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};