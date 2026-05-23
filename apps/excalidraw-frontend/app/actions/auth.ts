"use server";

import { auth } from "@repo/backend-common/lib/auth";
import { headers, cookies } from "next/headers";

export async function signUpAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
        const headerList = await headers();
        const cookieStore = await cookies();
        
        // Call better-auth API
        const response = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            },
            headers: headerList,
        });
        
        // Better-auth's response includes cookie information
        // We need to read the Set-Cookie headers from the response
        // Since auth.api doesn't return headers directly, we need to use a workaround
        // The cookies should be set automatically by better-auth when using Next.js handler
        // So let's just verify the user was created and return success
        
        if (!response.user) {
            return { error: "Failed to sign up" };
        }
        
        // Check if session cookie exists after signup
        // Better-auth should have set it, but let's verify
        const sessionToken = cookieStore.get("better-auth.session_token");
        
        if (!sessionToken) {
            // If cookie wasn't set, better-auth might not be handling it properly
            // This could be a configuration issue
            console.warn("Session cookie not found after signup");
        }
        
        return { success: true };
    } catch (error: any) {
        console.error("Sign up error:", error);
        return { error: error.message || "Failed to sign up" };
    }
}

export async function signInAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        const headerList = await headers();
        const cookieStore = await cookies();
        
        const response = await auth.api.signInEmail({
            body: {
                email,
                password,
            },
            headers: headerList,
        });
        
        if (!response.user) {
            return { error: "Invalid email or password" };
        }
        
        // Verify session cookie
        const sessionToken = cookieStore.get("better-auth.session_token");
        if (!sessionToken) {
            console.warn("Session cookie not found after signin");
        }
        
        return { success: true };
    } catch (error: any) {
        console.error("Sign in error:", error);
        return { error: error.message || "Failed to sign in" };
    }
}

export async function signOutAction() {
    try {
        await auth.api.signOut({
            headers: await headers(),
        });
        return { success: true };
    } catch (error) {
        return { success: true };
    }
}

export async function getCurrentUserAction() {
    try {
        const headerList = await headers();
        const session = await auth.api.getSession({
            headers: headerList,
        });
        
        if (session?.user) {
            console.log("[Server] Session user ID:", session.user.id);
            console.log("[Server] Session user name:", session.user.name);
            console.log("[Server] Session user email:", session.user.email);
            return { user: session.user };
        }
        
        console.log("[Server] No session or user found");
        return { user: null };
    } catch (error: any) {
        console.error("[Server] Error getting current user:", error);
        return { user: null };
    }
}