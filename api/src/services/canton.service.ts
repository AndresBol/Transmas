import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";

export const cantonService = {
    async list(pagination: PaginationOptions) {
        const [totalItems, data] = await Promise.all([
            prisma.canton.count(),
            prisma.canton.findMany({
                skip: pagination.skip,
                take: pagination.take,
                include: { province: true },
                orderBy: { name: "asc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const canton = await prisma.canton.findUnique({
            where: { id },
            include: {
                province: true,
                districts: true,
            },
        });

        if (!canton) {
            throw AppError.notFound("Canton not found");
        }

        return canton;
    },
};
