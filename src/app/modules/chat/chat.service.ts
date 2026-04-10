import { prisma } from "../../lib/prisma";
import { getIO } from "../../lib/socket";

const getOrCreateConversation = async (
    senderId: string,
    receiverId: string
) => {
    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: { userId: senderId },
            },
        },
        include: {
            participants: true,
        },
    });

    const existing = conversations.find((conv) => {
        const userIds = conv.participants.map((p) => p.userId);
        return (
            userIds.includes(senderId) &&
            userIds.includes(receiverId) &&
            userIds.length === 2
        );
    });

    if (existing) return existing;

    return prisma.conversation.create({
        data: {
            participants: {
                create: [
                    { userId: senderId },
                    { userId: receiverId },
                ],
            },
        },
    });
};

const sendMessage = async (
    sender: any,
    payload: { receiverId: string; text: string }
) => {
    const { receiverId, text } = payload;

    const conversation = await getOrCreateConversation(
        sender.id,
        receiverId
    );

    const message = await prisma.message.create({
        data: {
            text,
            senderId: sender.id,
            conversationId: conversation.id,
        },
    });

    const io = getIO();

    io.to(`user:${receiverId}`).emit("receive-message", {
        ...message,
        conversationId: conversation.id,
    });

    return {
        conversationId: conversation.id,
        message,
    };
};

const getMessages = async (conversationId: string) => {
    return prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
    });
};

const getMyConversations = async (user: any) => {
    return prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    userId: user.id,
                },
            },
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profileImage: true,
                        },
                    },
                },
            },
            messages: {
                take: 1,
                orderBy: { createdAt: "desc" },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const chatService = {
    sendMessage,
    getMessages,
    getMyConversations,
};