import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding avatars...");

    const avatars = [
        { style: "adventurer", seed: "starter-fox", label: "Rubah Petualang" },
        { style: "adventurer", seed: "starter-cat", label: "Kucing Ceria" },
        { style: "bottts", seed: "robot-blue", label: "Robot Biru" },
        { style: "bottts", seed: "robot-gold", label: "Robot Emas" },
        { style: "big-ears", seed: "panda-happy", label: "Panda Bahagia" },
        { style: "big-smile", seed: "star-champion", label: "Juara Bintang" },
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
            description: "Selesaikan level pertama (huruf A)",
            rewardAvatarId: createdAvatars[0].id,
        },
        {
            code: "COMPLETE_LEVEL_5",
            title: "Semangat Belajar",
            description: "Selesaikan 5 level",
            rewardAvatarId: createdAvatars[1].id,
        },
        {
            code: "COMPLETE_LEVEL_13",
            title: "Setengah Jalan",
            description: "Selesaikan 13 level",
            rewardAvatarId: createdAvatars[2].id,
        },
        {
            code: "COMPLETE_ALL_LEVELS",
            title: "Master Alfabet BISINDO",
            description: "Selesaikan semua 26 level",
            rewardAvatarId: createdAvatars[3].id,
        },
        {
            code: "PERFECT_SCORE_ANY_LEVEL",
            title: "Sempurna!",
            description: "Raih skor sempurna di salah satu level",
            rewardAvatarId: createdAvatars[4].id,
        },
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