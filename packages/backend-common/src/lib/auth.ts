import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prismaClient } from "db/client";
import { env } from "../config/env";
import { username } from "better-auth/plugins";


export const auth = betterAuth({
    database: prismaAdapter(prismaClient,{
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        autoSignIn: false,
    },
    socialProviders: {
        google: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? {
            provider: "select account",
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        } : undefined,
    },
    plugins: [
        username({
            minUsernameLength: 3,
            maxUsernameLength: 30,
            usernameValidator: (username) => {
                const reservedUsernames = ["admin", "administrator", "root", "api", "www"];
                if (reservedUsernames.includes(username.toLowerCase())) {
                    return false;
                }
                return /^[a-zA-Z0-9._]+$/.test(username);
            },
            usernameNormalization: (username) => {
                return username.toLowerCase();
            },
        }),
    ],

    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",
})