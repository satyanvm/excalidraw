import {Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = "123123";

export function middleware(req: Request, res: Response, next: NextFunction){
    const token = req.headers["authorization"] ?? "";

    const decoded = jwt.verify(token, JWT_SECRET);

    if(decoded){
        //@ts-ignore
        req.userId = decoded.userId;
        next();
    } else{
        res.status(403).json({
            message: "Unauthorized"
        })
    }
}