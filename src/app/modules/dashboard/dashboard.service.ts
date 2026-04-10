import { prisma } from "../../lib/prisma";
import { Role, PropertyStatus, ReportStatus } from "../../../generated/prisma/enums";

const getAdminDashboard = async () => {
  const [
    users,
    properties,
    bids,
    reports,
    blogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.bid.count(),
    prisma.report.count(),
    prisma.blog.count(),
  ]);

  const propertiesByStatus = await prisma.property.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const reportsByStatus = await prisma.report.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return {
    stats: {
      users,
      properties,
      bids,
      reports,
      blogs,
    },
    charts: {
      propertiesByStatus,
      reportsByStatus,
    },
  };
};


const getUserDashboard = async (userId: string) => {
  const [properties, bids, wonBids] = await Promise.all([
    prisma.property.count({ where: { ownerId: userId } }),
    prisma.bid.count({ where: { userId } }),
    prisma.bid.count({
      where: {
        userId,
        status: "WON",
      },
    }),
  ]);

  const recentBids = await prisma.bid.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        select: {
          title: true,
          location: true,
        },
      },
    },
  });

  return {
    stats: {
      myProperties: properties,
      myBids: bids,
      wonBids,
    },
    recentActivity: recentBids,
  };
};


const getManagerDashboard = async (userId: string) => {
  const assigned = await prisma.propertyAssignment.count({
    where: { managerId: userId },
  });

  const ongoing = await prisma.property.count({
    where: { status: PropertyStatus.ONGOING },
  });

  const completed = await prisma.property.count({
    where: { status: PropertyStatus.HANDED_OVER },
  });

  return {
    stats: {
      assigned,
      ongoing,
      completed,
    },
  };
};


const getModeratorDashboard = async () => {
  const pendingReports = await prisma.report.count({
    where: { status: ReportStatus.PENDING },
  });

  const resolvedReports = await prisma.report.count({
    where: { status: ReportStatus.RESOLVED },
  });

  return {
    stats: {
      pendingReports,
      resolvedReports,
    },
  };
};


export const dashboardService = {
  getDashboard: async (user: any) => {
    switch (user.role) {
      case Role.ADMIN:
        return getAdminDashboard();

      case Role.USER:
        return getUserDashboard(user.id);

      case Role.MANAGER:
        return getManagerDashboard(user.id);

      case Role.MODERATOR:
        return getModeratorDashboard();

      default:
        return { message: "No dashboard available for this role" };
    }
  },
};