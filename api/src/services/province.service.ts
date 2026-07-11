import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";

export const provinceService = {
    async list(pagination: PaginationOptions) {
        const [totalItems, data] = await Promise.all([
            prisma.province.count(),
            prisma.province.findMany({
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { name: "asc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const province = await prisma.province.findUnique({
            where: { id },
            include: { cantons: true },
        });

        if (!province) {
            throw AppError.notFound("Province not found");
        }

        return province;
    },
};
