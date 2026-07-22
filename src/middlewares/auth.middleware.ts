import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util.js";

export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const token = header.split(" ")[1];
    try {
        const payload = verifyToken(token);
        req.userId = payload.userId;
        next();
    } catch {
        return res.status(401).json({ message: "Token tidak valid atau kedaluwarsa" });
    }
};