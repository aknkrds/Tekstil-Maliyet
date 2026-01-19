import * as PrismaPkg from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const PrismaClient = (PrismaPkg as any).PrismaClient

const globalForPrisma = global as any

const url = process.env.DATABASE_URL || "file:./dev.db"

// Ensure DATABASE_URL is set for Prisma Client validation
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = url
}

// Pass config object directly to PrismaLibSql instead of client instance
const adapter = new PrismaLibSql({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
