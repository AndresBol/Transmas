import { prisma } from "../config/prisma";
import { CreateCantonDto, UpdateCantonDto } from "../dtos/canton.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";

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
            throw AppError.notFound("Canton no encontrado");
        }

        return canton;
    },

    async create(data: CreateCantonDto) {
        await this.validateProvince(data.provinceId);

        try {
            return await prisma.canton.create({
                data,
                include: { province: true },
            });
        } catch (error) {
            translatePrismaError(error, "canton");
        }
    },

    async update(id: number, data: UpdateCantonDto) {
        await this.getById(id);

        if (data.provinceId) {
            await this.validateProvince(data.provinceId);
        }

        try {
            return await prisma.canton.update({
                where: { id },
                data,
                include: { province: true },
            });
        } catch (error) {
            translatePrismaError(error, "canton");
        }
    },

    async delete(id: number) {
        await this.getById(id);

        try {
            return await prisma.canton.delete({ where: { id } });
        } catch (error) {
            translatePrismaError(error, "canton");
        }
    },

    async validateProvince(provinceId: number) {
        const exists = await prisma.province.findUnique({
            where: { id: provinceId },
        });

        if (!exists) {
            throw AppError.badRequest("La provincia indicada no existe");
        }
    },
};
