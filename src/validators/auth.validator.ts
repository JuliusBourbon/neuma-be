import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(50),
    password: z.string().min(6, "Password minimal 6 karakter"),
});

export const loginSchema = z.object({
    name: z.string().min(1, "Nama wajib diisi"),
    password: z.string().min(1, "Password wajib diisi"),
});

export const updateProfileSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    avatarStyle: z.string().optional(),
    avatarSeed: z.string().optional(),
});

export const updatePasswordSchema = z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
});

export const onboardingSchema = z.object({
    school: z.string().max(100).optional(),
    age: z.number().int().min(3).max(20).optional(),
    grade: z.string().max(20).optional(),
    hobby: z.string().max(100).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;