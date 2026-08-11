// A single shared PrismaClient instance, reused everywhere.
// Creating a new PrismaClient in every file would open too many
// database connections.
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
