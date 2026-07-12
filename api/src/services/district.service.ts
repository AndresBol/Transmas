import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";

const includeDistrict = {
    canton: {
        include: { province: true },
    },
} as const;

export const districtService = {
    async list(pagination: PaginationOptions) {
        const [totalItems, data] = await Promise.all([
            prisma.district.count(),
            prisma.district.findMany({
                skip: pagination.skip,
                take: pagination.take,
                include: includeDistrict,
                orderBy: { name: "asc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const district = await prisma.district.findUnique({
            where: { id },
            include: includeDistrict,
        });

        if (!district) {
            throw AppError.notFound("District not found");
        }

        return district;
    },
};
