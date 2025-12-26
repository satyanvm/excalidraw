import { PrismaClient } from "@prisma/client";

// Create Prisma Client with retry logic for Neon serverless database
// Neon databases suspend after inactivity and need time to wake up
const createPrismaClient = () => {
    const client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    return client;
};

// Global variable to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient;
}

// Helper function to execute database operations with retry logic
// This handles Neon database cold starts
export async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;
            const errorMessage = (error as Error).message || '';

            // Check if it's a connection error (Neon might be waking up)
            const isConnectionError =
                errorMessage.includes('Connection refused') ||
                errorMessage.includes('ECONNREFUSED') ||
                errorMessage.includes('Connection timed out') ||
                errorMessage.includes('ETIMEDOUT') ||
                errorMessage.includes('Sorry, too many clients already') ||
                errorMessage.includes('connect ECONNRESET');

            if (isConnectionError && attempt < maxRetries) {
                console.log(`Database connection attempt ${attempt} failed. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                throw error;
            }
        }
    }

    throw lastError;
}

// Keep-alive function to prevent database suspension
// Call this periodically if you want to keep the database active
export async function keepAlive(): Promise<boolean> {
    try {
        await prismaClient.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        console.error('Keep-alive query failed:', error);
        return false;
    }
}
