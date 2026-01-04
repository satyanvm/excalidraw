import { PrismaClient } from "@prisma/client";

// Create Prisma Client with retry logic for Supabase database
// Supabase requires SSL connections - ensure DATABASE_URL includes ?sslmode=require
const createPrismaClient = () => {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    // Warn if DATABASE_URL doesn't include SSL parameters (common Supabase issue)
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl.includes('supabase.co') && !dbUrl.includes('sslmode')) {
        console.warn('⚠️  WARNING: Your Supabase DATABASE_URL should include SSL parameters.');
        console.warn('   Add ?sslmode=require to your connection string.');
        console.warn('   Example: postgresql://user:pass@host:5432/db?sslmode=require');
    }
    const client = new PrismaClient();
    return client;
};

export const prismaClient = createPrismaClient();