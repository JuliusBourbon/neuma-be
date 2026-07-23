import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

async function main() {
    console.log("Seeding 26 levels (A-Z) along with Materials & Questions...");

    for (let i = 0; i < ALPHABET.length; i++) {
        const letter = ALPHABET[i];
        const order = i + 1;

        const level = await prisma.level.upsert({
            where: { letter },
            update: {}, // tidak overwrite jika sudah ada
            create: {
                letter,
                order,
                title: `Huruf ${letter}`,
                description: `Belajar mengenal dan mengisyaratkan huruf ${letter} dalam BISINDO`,
            },
        });

        // Seed Material
        const existingMaterialsCount = await prisma.material.count({ where: { levelId: level.id } });
        if (existingMaterialsCount === 0) {
            await prisma.material.createMany({
                data: [
                    { levelId: level.id, type: "GENERAL_INTRO", content: `Mengenal huruf ${letter}. Huruf ini adalah huruf ke-${order} dalam alfabet.`, order: 1 },
                    { levelId: level.id, type: "BISINDO_INTRO", content: `Berikut adalah cara memperagakan isyarat BISINDO untuk huruf ${letter}.`, mediaUrl: `https://example.com/assets/bisindo-${letter.toLowerCase()}.mp4`, order: 2 },
                    { levelId: level.id, type: "WORD_EXAMPLE", content: `Contoh kata yang diawali dengan huruf ${letter}.`, order: 3 },
                ]
            });
        }

        // Seed Question
        const existingQuestionsCount = await prisma.question.count({ where: { levelId: level.id } });
        if (existingQuestionsCount === 0) {
            // Question 1: Multiple Choice
            await prisma.question.create({
                data: {
                    levelId: level.id,
                    type: "MULTIPLE_CHOICE",
                    prompt: `Manakah gambar di bawah ini yang menunjukkan isyarat huruf ${letter}?`,
                    correctAnswer: "A",
                    order: 1,
                    options: {
                        create: [
                            { label: "A", content: `Isyarat yang benar untuk ${letter}`, mediaUrl: `https://example.com/assets/bisindo-${letter.toLowerCase()}.png` },
                            { label: "B", content: `Isyarat salah 1`, mediaUrl: `https://example.com/assets/bisindo-${letter === 'A' ? 'b' : 'a'}.png` },
                            { label: "C", content: `Isyarat salah 2`, mediaUrl: `https://example.com/assets/bisindo-${letter === 'Z' ? 'y' : 'z'}.png` },
                        ]
                    }
                }
            });

            // Question 2: Sign Practice
            await prisma.question.create({
                data: {
                    levelId: level.id,
                    type: "SIGN_PRACTICE",
                    prompt: `Sekarang giliranmu! Silakan peragakan isyarat huruf ${letter} di depan kamera.`,
                    correctAnswer: letter,
                    order: 2,
                }
            });
        }

        console.log(`  Level ${order}: ${letter} (beserta Material & Question) ✓`);
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