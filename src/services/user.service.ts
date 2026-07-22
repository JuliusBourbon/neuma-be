import { userRepository } from "../repositories/user.repository.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import { AppError } from "./auth.service.js";

export const userService = {
    getProfile: async (userId: string) => {
        const user = await userRepository.findById(userId);
        if (!user) throw new AppError(404, "User tidak ditemukan");
        return user;
    },

    updateProfile: async (
        userId: string,
        data: { name?: string; avatarStyle?: string; avatarSeed?: string }
    ) => {
        if (data.name) {
            const existing = await userRepository.findByName(data.name);
            if (existing && existing.id !== userId) {
                throw new AppError(409, "Nama sudah digunakan");
            }
        }
        return userRepository.updateProfile(userId, data);
    },

    updatePassword: async (
        userId: string,
        oldPassword: string,
        newPassword: string
    ) => {
        const { prisma } = await import("../lib/prisma.js");
        const fullUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!fullUser) throw new AppError(404, "User tidak ditemukan");

        const isValid = await comparePassword(oldPassword, fullUser.passwordHash);
        if (!isValid) throw new AppError(400, "Password lama salah");

        const newHash = await hashPassword(newPassword);
        await userRepository.updatePassword(userId, newHash);
    },
};