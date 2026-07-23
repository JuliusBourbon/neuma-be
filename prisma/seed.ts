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
    
    // Hapus data lama agar struktur baru (9 urutan) ter-apply
    await prisma.attemptAnswer.deleteMany({});
    await prisma.levelAttempt.deleteMany({});
    await prisma.userLevelProgress.deleteMany({});
    await prisma.questionOption.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.material.deleteMany({});
    await prisma.level.deleteMany({});

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
                    { levelId: level.id, type: "BISINDO_INTRO", content: `Berikut adalah cara memperagakan isyarat BISINDO untuk huruf ${letter}.`, mediaUrl: `https://example.com/assets/bisindo-${letter.toLowerCase()}.gif`, order: 2 },
                    { levelId: level.id, type: "WORD_EXAMPLE", content: `Contoh kata yang diawali dengan huruf ${letter}, misalnya: ${letter}pel.`, mediaUrl: `https://example.com/assets/word-${letter.toLowerCase()}.png`, order: 3 },
                ]
            });
        }

        // Seed Question
        const existingQuestionsCount = await prisma.question.count({ where: { levelId: level.id } });
        if (existingQuestionsCount === 0) {
            // Q1: MULTIPLE_CHOICE
            await prisma.question.create({
                data: {
                    levelId: level.id, type: "MULTIPLE_CHOICE", prompt: `Manakah gambar di bawah ini yang menunjukkan isyarat huruf ${letter}?`, correctAnswer: "A", order: 1,
                    options: {
                        create: [
                            { label: "A", content: `Isyarat ${letter}`, mediaUrl: `https://example.com/assets/bisindo-${letter.toLowerCase()}.png` },
                            { label: "B", content: `Isyarat salah 1`, mediaUrl: `https://example.com/assets/bisindo-${letter === 'A' ? 'b' : 'a'}.png` },
                            { label: "C", content: `Isyarat salah 2`, mediaUrl: `https://example.com/assets/bisindo-${letter === 'Z' ? 'y' : 'z'}.png` },
                        ]
                    }
                }
            });

            // Q2: MULTIPLE_CHOICE
            await prisma.question.create({
                data: {
                    levelId: level.id, type: "MULTIPLE_CHOICE", prompt: `Gambar isyarat ini menunjukkan huruf apa?`, mediaUrl: `https://example.com/assets/bisindo-${letter.toLowerCase()}.png`, correctAnswer: letter, order: 2,
                    options: {
                        create: [
                            { label: letter, content: `Huruf ${letter}` },
                            { label: letter === 'A' ? 'B' : 'A', content: `Huruf ${letter === 'A' ? 'B' : 'A'}` },
                            { label: letter === 'Z' ? 'Y' : 'Z', content: `Huruf ${letter === 'Z' ? 'Y' : 'Z'}` },
                        ]
                    }
                }
            });

            // Q3: TRUE_FALSE_VISUAL
            await prisma.question.create({
                data: {
                    levelId: level.id, type: "TRUE_FALSE_VISUAL", prompt: `Apakah gambar ini termasuk Huruf ${letter}?`, mediaUrl: `https://example.com/assets/bisindo-${letter.toLowerCase()}.png`, correctAnswer: "TRUE", order: 3,
                    options: {
                        create: [
                            { label: "TRUE", content: "Ya" },
                            { label: "FALSE", content: "Tidak" },
                        ]
                    }
                }
            });

            // Q4: TRUE_FALSE_VISUAL
            await prisma.question.create({
                data: {
                    levelId: level.id, type: "TRUE_FALSE_VISUAL", prompt: `Apakah gambar ini termasuk Huruf ${letter}?`, mediaUrl: `https://example.com/assets/bisindo-${letter === 'A' ? 'b' : 'a'}.png`, correctAnswer: "FALSE", order: 4,
                    options: {
                        create: [
                            { label: "TRUE", content: "Ya" },
                            { label: "FALSE", content: "Tidak" },
                        ]
                    }
                }
            });

            // Q5: SIGN_PRACTICE
            await prisma.question.create({
                data: {
                    levelId: level.id, type: "SIGN_PRACTICE", prompt: `Sekarang giliranmu! Silakan peragakan isyarat huruf ${letter} di depan kamera.`, correctAnswer: letter, order: 5,
                }
            });

            // Q6: SIGN_PRACTICE
            await prisma.question.create({
                data: {
                    levelId: level.id, type: "SIGN_PRACTICE", prompt: `Lagi! Coba peragakan kembali isyarat huruf ${letter} agar makin hafal.`, correctAnswer: letter, order: 6,
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