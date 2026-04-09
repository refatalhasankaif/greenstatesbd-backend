import dotenv from "dotenv";
import AppError from "../errors/AppError";

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;

  FRONTEND_URL: string;

  DATABASE_URL: string;

  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;

  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;

  ADMIN_EMAIL: string;
  ADMIN_FIREBASE_UID: string;
  ADMIN_NAME: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables = [
    "NODE_ENV",
    "PORT",
    "FRONTEND_URL",
    "DATABASE_URL",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "ADMIN_EMAIL",
    "ADMIN_FIREBASE_UID",
    "ADMIN_NAME",
  ];

  requiredEnvVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError(
        500,
        `Environment variable ${variable} is required but not set in .env file`
      );
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,

    FRONTEND_URL: process.env.FRONTEND_URL as string,

    DATABASE_URL: process.env.DATABASE_URL as string,

    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID as string,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL as string,
    FIREBASE_PRIVATE_KEY: (process.env.FIREBASE_PRIVATE_KEY as string).replace(
      /\\n/g,
      "\n"
    ),
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
    ADMIN_FIREBASE_UID: process.env.ADMIN_FIREBASE_UID as string,
    ADMIN_NAME: process.env.ADMIN_NAME as string,
  };
};

export const env = loadEnvVariables();