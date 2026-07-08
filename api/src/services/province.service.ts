import { prisma } from "../config/prisma";
import { CreateProvinceDto, UpdateProvinceDto } from "../dtos/province.dto";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { AppError } from "../utils/app-error";

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
            throw AppError.notFound("Provincia no encontrada");
        }

        return province;
    },

    async create(data: CreateProvinceDto) {
        try {
            return await prisma.province.create({ data });
        } catch (error) {
            translatePrismaError(error, "provincia");
        }
    },

    async update(id: number, data: UpdateProvinceDto) {
        await this.getById(id);

        try {
            return await prisma.province.update({
                where: { id },
                data,
            });
        } catch (error) {
            translatePrismaError(error, "provincia");
        }
    },

    async delete(id: number) {
        await this.getById(id);

        try {
            return await prisma.province.delete({ where: { id } });
        } catch (error) {
            translatePrismaError(error, "provincia");
        }
    },
};
