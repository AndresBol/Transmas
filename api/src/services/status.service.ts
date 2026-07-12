import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";

export const statusService = {
    async list(pagination: PaginationOptions) {
        const where = { isActive: true };
        const [totalItems, data] = await Promise.all([
            prisma.status.count({ where }),
            prisma.status.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { name: "asc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const status = await prisma.status.findFirst({
            where: { id, isActive: true },
        });

        if (!status) {
            throw AppError.notFound("Status not found");
        }

        return status;
    },
};
