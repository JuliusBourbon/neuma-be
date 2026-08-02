import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding avatars...");

    const avatars = [
        { style: "adventurer", seed: "Felix", label: "Petualang Sejati" },
        { style: "bottts", seed: "bot-alpha", label: "Robot Alpha" },
        { style: "bottts", seed: "bot-beta", label: "Robot Beta" },
        { style: "big-smile", seed: "smile-1", label: "Si Senyum" },
        { style: "big-ears", seed: "ears-1", label: "Telinga Lebar" },
        { style: "croodles", seed: "croodle-1", label: "Doodle Lucu" },
        { style: "fun-emoji", seed: "emoji-happy", label: "Emoji Bahagia" },
        { style: "lorelei", seed: "lor-1", label: "Lorelei" },
        { style: "micah", seed: "micah-1", label: "Micah" },
        { style: "miniavs", seed: "mini-1", label: "Miniatur" },
        { style: "open-peeps", seed: "peep-1", label: "Orang Biasa" },
        { style: "personas", seed: "persona-1", label: "Persona" },
        { style: "pixel-art", seed: "pixel-1", label: "Pixel 8-bit" }
    ];

    const createdAvatars = [];
    for (const a of avatars) {
        const avatar = await prisma.avatar.upsert({
            where: { id: `seed-${a.seed}` },
            update: {},
            create: { id: `seed-${a.seed}`, ...a },
        });
        createdAvatars.push(avatar);
        console.log(`  Avatar: ${a.label} ✓`);
    }

    console.log("Seeding achievements...");

    const achievements = [
        {
            code: "COMPLETE_LEVEL_1",
            title: "Langkah Pertama",
            description: "Selesaikan level 1",
            rewardAvatarId: createdAvatars[0].id,
        },
        {
            code: "COMPLETE_LEVEL_5",
            title: "Pemanasan",
            description: "Selesaikan 5 level",
            rewardAvatarId: createdAvatars[1].id,
        },
        {
            code: "COMPLETE_LEVEL_10",
            title: "Semakin Mahir",
            description: "Selesaikan 10 level",
            rewardAvatarId: createdAvatars[2].id,
        },
        {
            code: "COMPLETE_LEVEL_15",
            title: "Pejuang Literasi",
            description: "Selesaikan 15 level",
            rewardAvatarId: createdAvatars[3].id,
        },
        {
            code: "COMPLETE_LEVEL_20",
            title: "Hampir Lulus",
            description: "Selesaikan 20 level",
            rewardAvatarId: createdAvatars[4].id,
        },
        {
            code: "COMPLETE_LEVEL_25",
            title: "Selangkah Lagi",
            description: "Selesaikan 25 level",
            rewardAvatarId: createdAvatars[5].id,
        },
        {
            code: "COMPLETE_ALL_LEVELS",
            title: "Master BISINDO",
            description: "Selesaikan semua 26 level",
            rewardAvatarId: createdAvatars[6].id,
        },
        {
            code: "PERFECT_STREAK_1",
            title: "Awal yang Sempurna",
            description: "Dapatkan 1 perfect streak",
            rewardAvatarId: createdAvatars[7].id,
        },
        {
            code: "PERFECT_STREAK_5",
            title: "Fokus Tingkat Tinggi",
            description: "Dapatkan 5 perfect streak",
            rewardAvatarId: createdAvatars[8].id,
        },
        {
            code: "PERFECT_STREAK_10",
            title: "Tanpa Celah",
            description: "Dapatkan 10 perfect streak",
            rewardAvatarId: createdAvatars[9].id,
        },
        {
            code: "PERFECT_STREAK_20",
            title: "Legenda Kelas",
            description: "Dapatkan 20 perfect streak",
            rewardAvatarId: createdAvatars[10].id,
        },
        {
            code: "PERFECT_STREAK_ALL",
            title: "Sempurna Mutlak!",
            description: "Dapatkan perfect streak di semua 26 level",
            rewardAvatarId: createdAvatars[11].id,
        }
    ];

    for (const ach of achievements) {
        await prisma.achievement.upsert({
            where: { code: ach.code },
            update: {},
            create: ach,
        });
        console.log(`  Achievement: ${ach.title} ✓`);
    }

    console.log("Seeding achievement & avatar selesai.");
}

main()
    .catch((e) => {
        console.error("Seed gagal:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });