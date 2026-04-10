import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { BidStatus } from "../../../generated/prisma/enums";
import { getPagination } from "../../utils/pagination";

const createBid = async (payload: any, user: any) => {
    const property = await prisma.property.findUnique({
        where: { id: payload.propertyId },
    });

    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found");
    }

    const now = new Date();
    if (
        !property.biddingStart ||
        !property.biddingEnd ||
        now < property.biddingStart ||
        now > property.biddingEnd
    ) {
        throw new AppError(status.BAD_REQUEST, "Bidding is not active");
    }

    if (property.ownerId === user.id) {
        throw new AppError(status.BAD_REQUEST, "You cannot bid on your own property");
    }

    const minBid = property.currentBid || property.basePrice;

    if (payload.amount <= minBid) {
        throw new AppError(
            status.BAD_REQUEST,
            `Bid must be higher than ${minBid}`
        );
    }

    const bid = await prisma.bid.create({
        data: {
            amount: payload.amount,
            userId: user.id,
            propertyId: payload.propertyId,
        },
    });

    await prisma.property.update({
        where: { id: payload.propertyId },
        data: {
            currentBid: payload.amount,
        },
    });

    return bid;
};

const getMyBids = async (user: any, query: any) => {
  const { skip, limit, page } = getPagination(query);

  const where = { userId: user.id };

  const [data, total] = await Promise.all([
    prisma.bid.findMany({
      where,
      include: { property: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.bid.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

const getBidsByProperty = async (propertyId: string, query: any) => {
  const { skip, limit, page } = getPagination(query);

  const where = { propertyId };

  const [data, total] = await Promise.all([
    prisma.bid.findMany({
      where,
      include: { user: true },
      skip,
      take: limit,
      orderBy: { amount: "desc" },
    }),
    prisma.bid.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

const closeBidding = async (propertyId: string) => {
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
    });

    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found");
    }

    const highestBid = await prisma.bid.findFirst({
        where: { propertyId },
        orderBy: { amount: "desc" },
    });

    if (!highestBid) {
        throw new AppError(status.BAD_REQUEST, "No bids found");
    }

    await prisma.bid.update({
        where: { id: highestBid.id },
        data: { status: BidStatus.WON },
    });

    await prisma.bid.updateMany({
        where: {
            propertyId,
            NOT: { id: highestBid.id },
        },
        data: { status: BidStatus.LOST },
    });

    return highestBid;
};

export const bidService = {
    createBid,
    getMyBids,
    getBidsByProperty,
    closeBidding,
};