import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { getPagination } from "../../utils/pagination";

const createBid = async (payload: any, user: any) => {
    const property = await prisma.property.findUnique({
        where: { id: payload.propertyId },
        include: { owner: true },
    });

    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found");
    }

    if (property.status !== "ACTIVE") {
        throw new AppError(status.BAD_REQUEST, "This property is not accepting bids");
    }

    if (property.ownerId === user.id) {
        throw new AppError(status.BAD_REQUEST, "You cannot bid on your own property");
    }

    const minBid = property.currentBid || property.basePrice;

    if (payload.amount <= minBid) {
        throw new AppError(
            status.BAD_REQUEST,
            `Bid amount must be higher than ৳${minBid.toLocaleString()}`
        );
    }

    const bid = await prisma.bid.create({
        data: {
            amount: payload.amount,
            userId: user.id,
            propertyId: payload.propertyId,
            status: "ACTIVE",
        },
        include: { user: { select: { id: true, name: true, email: true } } },
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
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        basePrice: true,
                        currentBid: true,
                        location: true,
                        images: { select: { url: true }, take: 1 },
                    },
                },
            },
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

const getAllBids = async (query: any) => {
    const { skip, limit, page } = getPagination(query);

    const [data, total] = await Promise.all([
        prisma.bid.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                property: {
                    select: {
                        id: true,
                        title: true,
                        basePrice: true,
                        location: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.bid.count(),
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

const updateBidStatus = async (bidId: string, newStatus: any) => {
    const bid = await prisma.bid.findUnique({
        where: { id: bidId },
        include: { property: true, user: true },
    });

    if (!bid) {
        throw new AppError(status.NOT_FOUND, "Bid not found");
    }

    if (newStatus === "PROPERTY_SOLD") {
        const highestBid = await prisma.bid.findFirst({
            where: {
                propertyId: bid.propertyId,
                status: "ACTIVE",
            },
            orderBy: { amount: "desc" },
            include: { user: true },
        });

        if (!highestBid) {
            throw new AppError(status.BAD_REQUEST, "No active bids found for this property");
        }

        await prisma.property.update({
            where: { id: bid.propertyId },
            data: {
                ownerId: highestBid.userId,
                status: "SOLD",
                acceptedBidId: highestBid.id,
            },
        });

        await prisma.bid.update({
            where: { id: highestBid.id },
            data: { status: "PROPERTY_SOLD" },
        });


        await prisma.bid.updateMany({
            where: {
                propertyId: bid.propertyId,
                NOT: { id: highestBid.id },
                status: "ACTIVE",
            },
            data: { status: "CANCELLED" },
        });

        return await prisma.bid.findUnique({
            where: { id: highestBid.id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, profileImage: true },
                },
                property: {
                    select: { id: true, title: true },
                },
            },
        });
    }

    const updatedBid = await prisma.bid.update({
        where: { id: bidId },
        data: { status: newStatus },
        include: {
            user: {
                select: { id: true, name: true, email: true },
            },
            property: {
                select: { id: true, title: true },
            },
        },
    });

    return updatedBid;
};

const acceptBid = async (bidId: string, userId: string) => {
    const bid = await prisma.bid.findUnique({
        where: { id: bidId },
        include: { property: true },
    });

    if (!bid) {
        throw new AppError(status.NOT_FOUND, "Bid not found");
    }

    if (bid.property.ownerId !== userId) {
        throw new AppError(status.FORBIDDEN, "Only property owner can accept bids");
    }

    if (bid.status !== "ACTIVE") {
        throw new AppError(status.BAD_REQUEST, "Can only accept ACTIVE bids");
    }

    return updateBidStatus(bidId, "ACCEPTED");
};

const getBidById = async (bidId: string) => {
    const bid = await prisma.bid.findUnique({
        where: { id: bidId },
        include: {
            user: { select: { id: true, name: true, email: true } },
            property: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    basePrice: true,
                    currentBid: true,
                    location: true,
                    type: true,
                    images: { select: { url: true } },
                },
            },
        },
    });

    if (!bid) {
        throw new AppError(status.NOT_FOUND, "Bid not found");
    }

    return bid;
};

const closeBidding = async (propertyId: string) => {
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
    });

    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found");
    }

    if (property.status !== "ACTIVE") {
        throw new AppError(status.BAD_REQUEST, "Property bidding is already closed");
    }

    const highestBid = await prisma.bid.findFirst({
        where: { propertyId, status: "ACTIVE" },
        orderBy: { amount: "desc" },
    });

    if (!highestBid) {

        await prisma.property.update({
            where: { id: propertyId },
            data: { status: "CLOSED" },
        });

        return {
            property,
            winningBid: null,
        };
    }


    await prisma.bid.update({
        where: { id: highestBid.id },
        data: { status: "PROPERTY_SOLD" },
    });


    await prisma.bid.updateMany({
        where: {
            propertyId,
            NOT: { id: highestBid.id },
            status: "ACTIVE",
        },
        data: { status: "CANCELLED" },
    });


    await prisma.property.update({
        where: { id: propertyId },
        data: {
            status: "CLOSED",
            ownerId: highestBid.userId,
            acceptedBidId: highestBid.id,
        },
    });

    return {
        property,
        winningBid: highestBid,
    };
};

export const bidService = {
    createBid,
    getMyBids,
    getBidById,
    getBidsByProperty,
    getAllBids,
    updateBidStatus,
    acceptBid,
    closeBidding,
};