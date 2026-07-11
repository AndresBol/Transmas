import { prisma } from "../config/prisma";
import { CreateSpecialtyDto, UpdateSpecialtyDto } from "../dtos/specialty.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { getSeededAdministrator } from "./service-helpers";

export const specialtyService = {
    async list(pagination: PaginationOptions) {
        const [totalItems, data] = await Promise.all([
            prisma.specialty.count({ where: { isActive: true } }),
            prisma.specialty.findMany({
                where: { isActive: true },
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { name: "asc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const specialty = await prisma.specialty.findFirst({
            where: { id, isActive: true },
        });

        if (!specialty) {
            throw AppError.notFound("Specialty not found");
        }

        return specialty;
    },

    async create(data: CreateSpecialtyDto) {
        const administrator = await getSeededAdministrator();

        try {
            return await prisma.specialty.create({
                data: {
                    name: data.name,
                    description: data.description,
                    isAvailable: data.isAvailable,
                    createdById: administrator.id,
                    lastUpdatedById: administrator.id,
                },
            });
        } catch (error) {
            translatePrismaError(error, "specialty");
        }
    },

    async update(id: number, data: UpdateSpecialtyDto) {
        await this.getById(id);
        const administrator = await getSeededAdministrator();

        try {
            return await prisma.specialty.update({
                where: { id },
                data: {
                    ...data,
                    lastUpdatedById: administrator.id,
                },
            });
        } catch (error) {
            translatePrismaError(error, "specialty");
        }
    },

    async updateAvailability(id: number, isAvailable: boolean) {
        await this.getById(id);
        const administrator = await getSeededAdministrator();

        return await prisma.specialty.update({
            where: { id },
            data: {
                isAvailable,
                lastUpdatedById: administrator.id,
            },
        });
    },
};
