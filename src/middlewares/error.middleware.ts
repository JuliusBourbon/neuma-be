import { Request, Response, NextFunction } from "express";
import { AppError } from "../services/auth.service.js";
import { ZodError } from "zod";

export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Validasi gagal",
            errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
};