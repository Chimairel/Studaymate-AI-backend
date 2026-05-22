import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

console.log("🔌 Database Connection String (masked):", connectionString.replace(/:[^@:]+@/, ":****@"));

// @ts-ignore
const adapter = new PrismaNeonHttp(connectionString);

export const prisma = new PrismaClient({ adapter });







