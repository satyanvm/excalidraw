import { auth } from "@repo/backend-common/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || !session?.session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // This is the token stored in the Session table
        const sessionToken = session.session.token;

        return NextResponse.json({ 
            token: sessionToken, 
            userId: session.user.id 
        });
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}