import { Request, NextFunction, Response } from "express";
import { auth } from "@repo/backend-common/lib/auth";

export async function middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Get session from better-auth
        // better-auth uses cookies, so we need to extract the session cookie
        const sessionCookie = req.headers.cookie || "";
        const session = await auth.api.getSession({
            headers: {
                cookie: sessionCookie,
            } as any,
        });

        if (!session?.user) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }

        // Attach user info to request
        (req as any).userId = session.user.id;
        (req as any).user = session.user;
        next();
    } catch (error) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }
}