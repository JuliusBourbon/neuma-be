import { avatarRepository } from "../repositories/avatar.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "./auth.service.js";

const DICEBEAR_BASE_URL = "https://api.dicebear.com/9.x";

const buildAvatarUrl = (style: string, seed: string) =>
    `${DICEBEAR_BASE_URL}/${style}/svg?seed=${encodeURIComponent(seed)}`;

export const avatarService = {
    listForUser: async (userId: string) => {
        const [allAvatars, unlockedAvatars] = await Promise.all([
            avatarRepository.findAll(),
            avatarRepository.findUnlockedAvatarsByUser(userId),
        ]);

        const unlockedIds = new Set(unlockedAvatars.map((a) => a.id));

        return allAvatars.map((avatar) => ({
            id: avatar.id,
            label: avatar.label,
            previewUrl: buildAvatarUrl(avatar.style, avatar.seed),
            isUnlocked: unlockedIds.has(avatar.id),
        }));
    },

    selectAvatar: async (userId: string, avatarId: string) => {
        const avatar = await avatarRepository.findById(avatarId);
        if (!avatar) throw new AppError(404, "Avatar tidak ditemukan");

        const unlockedAvatars = await avatarRepository.findUnlockedAvatarsByUser(userId);
        const isUnlocked = unlockedAvatars.some((a) => a.id === avatarId);

        if (!isUnlocked) {
            throw new AppError(403, "Avatar ini belum terbuka");
        }

        return userRepository.updateProfile(userId, {
            avatarStyle: avatar.style,
            avatarSeed: avatar.seed,
        });
    },
};