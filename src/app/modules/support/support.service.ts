import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { Role, SupportStatus } from "../../../generated/prisma/enums";

const findAvailableAgent = async () => {
  const agent = await prisma.user.findFirst({
    where: {
      role: Role.SUPPORT_AGENT,
      isBlocked: false,
    },
  });

  return agent;
};

const requestSupport = async (user: any) => {
  const agent = await findAvailableAgent();

  if (!agent) {
    throw new AppError(
      status.BAD_REQUEST,
      "No support agent available right now"
    );
  }

  const session = await prisma.supportSession.create({
    data: {
      userId: user.id,
      agentId: agent.id,
    },
  });

  return session;
};

const acceptSession = async (id: string, user: any) => {
  if (user.role !== Role.SUPPORT_AGENT) {
    throw new AppError(status.FORBIDDEN, "Only agents allowed");
  }

  const session = await prisma.supportSession.findUnique({
    where: { id },
  });

  if (!session) {
    throw new AppError(status.NOT_FOUND, "Session not found");
  }

  return prisma.supportSession.update({
    where: { id },
    data: {
      status: SupportStatus.ACCEPTED,
      startedAt: new Date(),
    },
  });
};

const rejectSession = async (id: string, user: any) => {
  if (user.role !== Role.SUPPORT_AGENT) {
    throw new AppError(status.FORBIDDEN, "Only agents allowed");
  }

  return prisma.supportSession.update({
    where: { id },
    data: {
      status: SupportStatus.REJECTED,
    },
  });
};

const endSession = async (id: string) => {
  return prisma.supportSession.update({
    where: { id },
    data: {
      endedAt: new Date(),
    },
  });
};

export const supportService = {
  requestSupport,
  acceptSession,
  rejectSession,
  endSession,
};