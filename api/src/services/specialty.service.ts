import { prisma } from "../config/prisma";
import { CreateSpecialtyDto, UpdateSpecialtyDto } from "../dtos/specialty.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { lastUpdatedByOrCreator, validateAuditUsers } from "./service-helpers";

export const specialtyService = {
    async list(pagination: PaginationOptions) {
        const where = { isActive: true };
        const [totalItems, data] = await Promise.all([
            prisma.specialty.count({ where }),
            prisma.specialty.findMany({
                where,
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
            throw AppError.notFound("Especialidad no encontrada");
        }

        return specialty;
    },

    async create(data: CreateSpecialtyDto) {
        await validateAuditUsers(data);

        try {
            return await prisma.specialty.create({
                data: {
                    name: data.name,
                    description: data.description,
                    isAvailable: data.isAvailable,
                    createdById: data.createdById,
                    lastUpdatedById: lastUpdatedByOrCreator(data),
                },
            });
        } catch (error) {
            translatePrismaError(error, "especialidad");
        }
    },

    async update(id: number, data: UpdateSpecialtyDto) {
        await this.getById(id);
        await validateAuditUsers(data);

        try {
            return await prisma.specialty.update({
                where: { id },
                data,
            });
        } catch (error) {
            translatePrismaError(error, "especialidad");
        }
    },

    async delete(id: number) {
        await this.getById(id);

        return await prisma.specialty.update({
            where: { id },
            data: { isActive: false },
        });
    },
};
