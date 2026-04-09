import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { firebaseAdmin } from "../../lib/firebase";
import { IRegisterUser, ILoginUser, ISocialAuth } from "./auth.interface";
import { env } from "../../config/env";
import { Role } from "../../../generated/prisma/enums";

const checkEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "No account found");
  }

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
      },
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
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (user.isBlocked) {
    throw new AppError(status.FORBIDDEN, "User blocked");
  }

  return {
    token: data.idToken,
    user,
  };
};

const socialAuth = async (payload: ISocialAuth) => {
  const existing = await prisma.user.findUnique({
    where: { firebaseUid: payload.firebaseUid },
  });

  if (existing) return existing;

  const user = await prisma.user.create({
    data: {
      firebaseUid: payload.firebaseUid,
      email: payload.email,
      name: payload.name,
      profileImage: payload.profileImage,
      role: Role.USER,
    },
  });

  return user;
};

export const authService = {
  checkEmail,
  registerUser,
  loginUser,
  socialAuth,
};