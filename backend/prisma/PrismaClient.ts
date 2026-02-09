import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

export const getPrisma = (database_url: string) => {
  if (!database_url) {
    throw new Error("DATABASE_URL is missing");
  }

  const pool = new Pool({ connectionString: database_url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  return prisma;
};


