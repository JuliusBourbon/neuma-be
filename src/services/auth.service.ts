import { userRepository } from "../repositories/user.repository.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import { signToken } from "../utils/jwt.util.js";

export class AppError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
    }
}

export const authService = {
    register: async (name: string, password: string) => {
        const existing = await userRepository.findByName(name);
        if (existing) {
            throw new AppError(409, "Nama sudah digunakan, silakan pilih nama lain");
        }

        const passwordHash = await hashPassword(password);
        const user = await userRepository.create(name, passwordHash);

        const token = signToken({ userId: user.id, name: user.name });

        return {
            token,
            user: { id: user.id, name: user.name },
        };
    },

    login: async (name: string, password: string) => {
        const user = await userRepository.findByName(name);
        if (!user) {
            throw new AppError(401, "Nama atau password salah");
        }

        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
            throw new AppError(401, "Nama atau password salah");
        }

        const token = signToken({ userId: user.id, name: user.name });

        return {
            token,
            user: { id: user.id, name: user.name, avatarSeed: user.avatarSeed, avatarStyle: user.avatarStyle },
        };
    },
};