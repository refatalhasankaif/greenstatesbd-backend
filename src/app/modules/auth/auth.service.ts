import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { firebaseAdmin } from "../../lib/firebase";
import { IRegisterUser, ILoginUser, ISocialAuth } from "./auth.interface";
import { env } from "../../config/env";
import { Role } from "../../../generated/prisma/enums";

const userSelect = {
    id: true,
    name: true,
    firebaseUid: true,
    email: true,
    role: true,
    profileImage: true,
    isBlocked: true,
    isVerified: true,
    verificationStatus: true,
    createdAt: true,
};

const checkEmail = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(status.NOT_FOUND, "No account found");
    return true;
};

const registerUser = async (payload: IRegisterUser) => {
    let firebaseUser;

    try {
        firebaseUser = await firebaseAdmin.auth().createUser({
            email: payload.email,
            password: payload.password,
            displayName: payload.name,
            photoURL: payload.profileImage,
        });
    } catch (error: any) {
        if (error.code === "auth/email-already-exists") {
            throw new AppError(status.CONFLICT, "Email already exists");
        }
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Firebase error");
    }

    try {
        const user = await prisma.user.create({
            data: {
                firebaseUid: firebaseUser.uid,
                email: payload.email,
                name: payload.name,
                profileImage: payload.profileImage,
                role: Role.USER,
                isVerified: false,
                verificationStatus: "PENDING",
            },
            select: userSelect,
        });

        return user;
    } catch {
        await firebaseAdmin.auth().deleteUser(firebaseUser.uid);
        throw new AppError(status.INTERNAL_SERVER_ERROR, "DB error");
    }
};

const loginUser = async (payload: ILoginUser) => {
    const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.FIREBASE_WEB_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: payload.email,
                password: payload.password,
                returnSecureToken: true,
            }),
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new AppError(status.UNAUTHORIZED, "Invalid credentials");
    }

    const user = await prisma.user.findUnique({
        where: { email: payload.email },
        select: userSelect,
    });

    if (!user) throw new AppError(status.NOT_FOUND, "User not found");
    if (user.isBlocked) throw new AppError(status.FORBIDDEN, "User blocked");

    return {
        token: data.idToken,
        user,
    };
};


const socialAuth = async (payload: ISocialAuth) => {
    const email =
        payload.email && payload.email.trim() !== ""
            ? payload.email
            : `twitter_${payload.firebaseUid}@placeholder.greenstatesbd.com`;

    let user = await prisma.user.findUnique({
        where: { firebaseUid: payload.firebaseUid },
        select: userSelect,
    });

    if (!user) {
        const existingByEmail = await prisma.user.findUnique({
            where: { email },
            select: userSelect,
        });

        if (existingByEmail) {
            user = await prisma.user.update({
                where: { email },
                data: { firebaseUid: payload.firebaseUid },
                select: userSelect,
            });
        } else {
            user = await prisma.user.create({
                data: {
                    firebaseUid: payload.firebaseUid,
                    email,
                    name: payload.name || "User",
                    profileImage: payload.profileImage,
                    role: Role.USER,
                    isVerified: false,
                    verificationStatus: "PENDING",
                },
                select: userSelect,
            });
        }
    }

    if (user.isBlocked) {
        throw new AppError(status.FORBIDDEN, "User blocked");
    }
    return {
        token: payload.idToken,
        user,
    };
};

export const authService = {
    checkEmail,
    registerUser,
    loginUser,
    socialAuth,
};