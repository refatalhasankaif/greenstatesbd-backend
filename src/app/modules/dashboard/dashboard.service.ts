import { prisma } from "../../lib/prisma";
import { Role } from "../../../generated/prisma/enums";

const getDashboard = async (user: any, query: any) => {
  const { page = 1, limit = 10 } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  if (user.role === Role.ADMIN) {
    const [
      totalUsers,
      totalProperties,
      totalBlogs,
      totalReports,
      recentUsers,
      recentProperties,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.blog.count(),
      prisma.report.count(),

      prisma.user.findMany({
        take,
        skip,
        orderBy: { createdAt: "desc" },
      }),

      prisma.property.findMany({
        take,
        skip,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const userStats = await prisma.user.groupBy({
      by: ["createdAt"],
      _count: true,
      orderBy: { createdAt: "asc" },
    });

    return {
      role: "ADMIN",
      overview: {
        totalUsers,
        totalProperties,
        totalBlogs,
        totalReports,
      },
      charts: {
        userGrowth: userStats,
      },
      tables: {
        recentUsers,
        recentProperties,
      },
    };
  }

  if (user.role === Role.USER) {
    const [myProperties, myBids, myBlogs, myReports] =
      await Promise.all([
        prisma.property.findMany({
          where: { ownerId: user.id },
          take,
          skip,
          orderBy: { createdAt: "desc" },
        }),

        prisma.bid.findMany({
          where: { userId: user.id },
          take,
          skip,
          orderBy: { createdAt: "desc" },
        }),

        prisma.blog.findMany({
          where: { authorId: user.id },
          take,
          skip,
          orderBy: { createdAt: "desc" },
        }),

        prisma.report.findMany({
          where: { userId: user.id },
          take,
          skip,
          orderBy: { createdAt: "desc" },
        }),
      ]);

    return {
      role: "USER",
      overview: {
        properties: myProperties.length,
        bids: myBids.length,
        blogs: myBlogs.length,
        reports: myReports.length,
      },
      tables: {
        myProperties,
        myBids,
        myBlogs,
        myReports,
      },
    };
  }

  if (user.role === Role.MANAGER) {
    const assigned = await prisma.propertyAssignment.findMany({
      where: { managerId: user.id },
      include: {
        property: true,
      },
      take,
      skip,
    });

    return {
      role: "MANAGER",
      overview: {
        assignedProperties: assigned.length,
      },
      tables: {
        assignedProperties: assigned,
      },
    };
  }

  if (user.role === Role.MODERATOR) {
    const [pendingReports, gallery, blogs, verifications] =
      await Promise.all([
        prisma.report.findMany({
          where: { status: "PENDING" },
          take,
          skip,
        }),

        prisma.gallery.findMany({
          take,
          skip,
          orderBy: { createdAt: "desc" },
        }),

        prisma.blog.findMany({
          take,
          skip,
          orderBy: { createdAt: "desc" },
        }),

        prisma.verificationRequest.findMany({
          where: { status: "PENDING" },
          take,
          skip,
        }),
      ]);

    return {
      role: "MODERATOR",
      overview: {
        pendingReports: pendingReports.length,
        pendingVerifications: verifications.length,
      },
      tables: {
        reports: pendingReports,
        gallery,
        blogs,
        verifications,
      },
    };
  }

  // 🎧 SUPPORT AGENT (MINIMAL)
  if (user.role === Role.SUPPORT_AGENT) {
    const sessions = await prisma.supportSession.findMany({
      where: { agentId: user.id },
      take,
      skip,
      orderBy: { createdAt: "desc" },
    });

    return {
      role: "SUPPORT_AGENT",
      overview: {
        totalSessions: sessions.length,
      },
      tables: {
        sessions,
      },
    };
  }

  return {};
};

export const dashboardService = {
  getDashboard,
};