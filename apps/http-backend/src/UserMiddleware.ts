import { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "123123";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.status(401).json({
      message: "Authorization header required",
    });
    return;
  }

  // Support both "Bearer token" and just "token" formats
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    //@ts-ignore
    console.log("decoded.userId is " + decoded.userId);
    //@ts-ignore
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("JWT verification error:", error);
    res.status(403).json({
      message: "Invalid or expired token",
    });
  }
}
