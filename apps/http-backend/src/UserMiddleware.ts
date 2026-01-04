import { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"] ?? "";
//@ts-ignore
  const decoded = jwt.verify(token, "123123");
  //@ts-ignore
  console.log("decoded.usrid is " + decoded.userId);
  if (decoded) {
    //@ts-ignore
    req.userId = decoded.userId;
    next();
  } else {
    res.status(403).json({
      message: "Unauthorized",
    });
  }
}
