import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { BidStatus } from "../../../generated/prisma/enums";

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

const getMyBids = async (user: any) => {
    return prisma.bid.findMany({
        where: { userId: user.id },
        include: {
            property: true,
        },
        orderBy: { createdAt: "desc" },
    });
};

const getBidsByProperty = async (propertyId: string) => {
    return prisma.bid.findMany({
        where: { propertyId },
        include: {
            user: true,
        },
        orderBy: { amount: "desc" },
    });
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