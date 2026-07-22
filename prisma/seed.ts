import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

async function main() {
    console.log("Seeding 26 levels (A-Z)...");

    for (let i = 0; i < ALPHABET.length; i++) {
        const letter = ALPHABET[i];
        const order = i + 1;

        await prisma.level.upsert({
            where: { letter },
            update: {}, // tidak overwrite jika sudah ada
            create: {
                letter,
                order,
                title: `Huruf ${letter}`,
                description: `Belajar mengenal dan mengisyaratkan huruf ${letter} dalam BISINDO`,
            },
        });

        console.log(`  Level ${order}: ${letter} ✓`);
    }

    console.log("Seeding selesai.");
}

main()
    .catch((e) => {
        console.error("Seed gagal:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });