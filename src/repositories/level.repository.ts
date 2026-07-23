import { prisma } from "../lib/prisma.js";

export const levelRepository = {
    findAllOrdered: () => {
        return prisma.level.findMany({
            orderBy: { order: "asc" },
        });
    },

    findById: (id: string) => {
        return prisma.level.findUnique({ where: { id } });
    },

    findByOrder: (order: number) => {
        return prisma.level.findUnique({ where: { order } });
    },

    findMaterialsByLevelId: (levelId: string) => {
        return prisma.material.findMany({
            where: { levelId },
            orderBy: { order: "asc" },
        });
    },

    findQuestionsByLevelId: (levelId: string) => {
        return prisma.question.findMany({
            where: { levelId },
            orderBy: { order: "asc" },
            include: { options: true },
        });
    },
};