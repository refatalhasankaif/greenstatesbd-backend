import { prisma } from "../../lib/prisma";
import { Role, PropertyStatus, ReportStatus } from "../../../generated/prisma/enums";

const getUserMenuItems = () => [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Profile", href: "/profile", icon: "User" },
    { label: "My Properties", href: "/properties/my", icon: "Home" },
    { label: "Create Property", href: "/properties/create", icon: "Plus" },
    { label: "My Bids", href: "/bids/my", icon: "TrendingUp" },
    { label: "My Reports", href: "/reports/my", icon: "AlertCircle" },
];

const getManagerMenuItems = () => [
    { label: "Pro Panel", href: "/pro-panel", icon: "LayoutDashboard" },
    { label: "Assigned Properties", href: "/pro-panel/properties", icon: "Home" },
    { label: "In Progress", href: "/pro-panel/properties/ongoing", icon: "Clock" },
    { label: "Completed", href: "/pro-panel/properties/completed", icon: "CheckCircle" },
    { label: "Reports", href: "/pro-panel/reports", icon: "AlertCircle" },
];

const getModeratorMenuItems = () => [
    { label: "Pro Panel", href: "/pro-panel", icon: "LayoutDashboard" },
    { label: "Pending Reports", href: "/pro-panel/reports/pending", icon: "AlertCircle" },
    { label: "All Reports", href: "/pro-panel/reports", icon: "FileText" },
    { label: "Management", href: "/pro-panel/management", icon: "Settings" },
];

const getAdminMenuItems = () => [
    { label: "Admin Panel", href: "/admin", icon: "LayoutDashboard" },
    { label: "Users", href: "/admin/users", icon: "Users" },
    { label: "Properties", href: "/admin/properties", icon: "Home" },
    { label: "Bids", href: "/admin/bids", icon: "TrendingUp" },
    { label: "Reports", href: "/admin/reports", icon: "AlertCircle" },
    { label: "Blogs", href: "/admin/blogs", icon: "FileText" },
    { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
    { label: "Settings", href: "/admin/settings", icon: "Settings" },
];

const getAdminDashboard = async () => {
    const [
        users,
        properties,
        bids,
        reports,
        blogs,
        gallery,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.property.count(),
        prisma.bid.count(),
        prisma.report.count(),
        prisma.blog.count(),
        prisma.gallery.count(),
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
            totalUsers: users,
            totalProperties: properties,
            activeProperties: properties,
            totalBids: bids,
            activeBids: bids,
            totalReports: reports,
            pendingReports: reports,
            totalBlogs: blogs,
            totalGallery: gallery,
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
                status: "PROPERTY_SOLD",
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

    const active = await prisma.property.count({
        where: { status: PropertyStatus.ACTIVE },
    });

    const completed = await prisma.property.count({
        where: { status: PropertyStatus.HANDED_OVER },
    });

    return {
        stats: {
            assigned,
            active,
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
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
        };

        switch (user.role) {
            case Role.ADMIN:
                return {
                    user: userData,
                    menu: getAdminMenuItems(),
                    data: await getAdminDashboard(),
                };

            case Role.USER:
                return {
                    user: userData,
                    menu: getUserMenuItems(),
                    data: await getUserDashboard(user.id),
                };

            case Role.MANAGER:
                return {
                    user: userData,
                    menu: getManagerMenuItems(),
                    data: await getManagerDashboard(user.id),
                };

            case Role.MODERATOR:
                return {
                    user: userData,
                    menu: getModeratorMenuItems(),
                    data: await getModeratorDashboard(),
                };

            default:
                return {
                    user: userData,
                    menu: [],
                    message: "No dashboard available for this role",
                };
        }
    },
};