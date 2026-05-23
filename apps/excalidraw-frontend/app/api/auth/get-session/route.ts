import { auth } from "@repo/backend-common/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        
        if (session?.user) {
            return NextResponse.json({ user: session.user });
        }
        
        // No session found
        return NextResponse.json({ user: null }, { status: 200 });
    } catch (error: any) {
        console.error("Error getting session:", error);
        return NextResponse.json({ user: null, error: error.message }, { status: 200 });
    }
}