import { prisma } from "../config/prisma";
import { CreateDistrictDto, UpdateDistrictDto } from "../dtos/district.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";

export const districtService = {
    async list(pagination: PaginationOptions) {
        const [totalItems, data] = await Promise.all([
            prisma.district.count(),
            prisma.district.findMany({
                skip: pagination.skip,
                take: pagination.take,
                include: {
                    canton: {
                        include: { province: true },
                    },
                },
                orderBy: { name: "asc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const district = await prisma.district.findUnique({
            where: { id },
            include: {
                canton: {
                    include: { province: true },
                },
            },
        });

        if (!district) {
            throw AppError.notFound("Distrito no encontrado");
        }

        return district;
    },

    async create(data: CreateDistrictDto) {
        await this.validateCanton(data.cantonId);

        try {
            return await prisma.district.create({
                data,
                include: {
                    canton: {
                        include: { province: true },
                    },
                },
            });
        } catch (error) {
            translatePrismaError(error, "distrito");
        }
    },

    async update(id: number, data: UpdateDistrictDto) {
        await this.getById(id);

        if (data.cantonId) {
            await this.validateCanton(data.cantonId);
        }

        try {
            return await prisma.district.update({
                where: { id },
                data,
                include: {
                    canton: {
                        include: { province: true },
                    },
                },
            });
        } catch (error) {
            translatePrismaError(error, "distrito");
        }
    },

    async delete(id: number) {
        await this.getById(id);

        try {
            return await prisma.district.delete({ where: { id } });
        } catch (error) {
            translatePrismaError(error, "distrito");
        }
    },

    async validateCanton(cantonId: number) {
        const exists = await prisma.canton.findUnique({
            where: { id: cantonId },
        });

        if (!exists) {
            throw AppError.badRequest("El canton indicado no existe");
        }
    },
};
