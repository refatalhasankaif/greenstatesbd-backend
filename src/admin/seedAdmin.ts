/* eslint-disable no-console */
import "dotenv/config";
import { PrismaClient, Role } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

async function seedAdmin() {
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL! },
    update: {},
    create: {
      name: process.env.ADMIN_NAME || "Admin",
      email: process.env.ADMIN_EMAIL!,
      firebaseUid: process.env.ADMIN_FIREBASE_UID!,
      role: Role.ADMIN,
      profileImage: "",
    },
  });

  console.log("Admin seeded:", admin.email);
}

seedAdmin()
  .catch((err) => {
    console.error("Seeding failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });