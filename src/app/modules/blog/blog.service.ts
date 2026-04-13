import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { ICreateBlog, IUpdateBlog } from "./blog.interface";
import { Role } from "../../../generated/prisma/enums";
import { getPagination } from "../../utils/pagination";
import { IPaginationQuery } from "../../utils/pagination";
import { Prisma } from "../../../generated/prisma/client";

type AuthUser = {
    id: string;
    role: Role;
};

const createBlog = async (payload: ICreateBlog, user: AuthUser) => {
    return prisma.blog.create({
        data: {
            ...payload,
            authorId: user.id,
        },
    });
};

const getAllBlogs = async (query: IPaginationQuery) => {
    const { skip, limit, page } = getPagination(query);

    const where: Prisma.BlogWhereInput = {
        isBlocked: false,
    };

    const [data, total] = await Promise.all([
        prisma.blog.findMany({
            where,
            include: { author: true },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.blog.count({ where }),
    ]);

    return {
        meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
        data,
    };
};

const getBlogById = async (id: string) => {
    const blog = await prisma.blog.findUnique({
        where: { id },
        include: {
            author: true,
        },
    });

    if (!blog) {
        throw new AppError(status.NOT_FOUND, "Blog not found");
    }

    return blog;
};

const updateBlog = async (
    id: string,
    payload: IUpdateBlog,
    user: any
) => {
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
        throw new AppError(status.NOT_FOUND, "Blog not found");
    }

    if (blog.authorId !== user.id) {
        throw new AppError(status.FORBIDDEN, "Not allowed");
    }

    return prisma.blog.update({
        where: { id },
        data: payload,
    });
};

const deleteBlog = async (id: string, user: any) => {
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
        throw new AppError(status.NOT_FOUND, "Blog not found");
    }

    if (
        blog.authorId !== user.id &&
        user.role !== Role.ADMIN
    ) {
        throw new AppError(status.FORBIDDEN, "Not allowed");
    }

    return prisma.blog.delete({
        where: { id },
    });
};

const toggleBlockBlog = async (
    id: string,
    isBlocked: boolean,
    user: any
) => {
    if (
        user.role !== Role.ADMIN &&
        user.role !== Role.MODERATOR
    ) {
        throw new AppError(status.FORBIDDEN, "Not allowed");
    }

    return prisma.blog.update({
        where: { id },
        data: { isBlocked },
    });
};

const getMyBlogs = async (user: any, query: IPaginationQuery) => {
    const { skip, limit, page } = getPagination(query);

    const [data, total] = await Promise.all([
        prisma.blog.findMany({
            where: { authorId: user.id },
            include: { author: true },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.blog.count({ where: { authorId: user.id } }),
    ]);

    return {
        data,
        meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    };
};

const getAllBlogsAdmin = async (query: IPaginationQuery) => {
    const { skip, limit, page } = getPagination(query);

    const [data, total] = await Promise.all([
        prisma.blog.findMany({
            include: { author: true },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.blog.count(),
    ]);

    return {
        meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
        data,
    };
};

export const blogService = {
    createBlog,
    getAllBlogs,
    getAllBlogsAdmin,
    getBlogById,
    updateBlog,
    deleteBlog,
    toggleBlockBlog,
    getMyBlogs,
};