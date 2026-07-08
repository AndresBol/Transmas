import { prisma } from "../config/prisma";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { lastUpdatedByOrCreator, validateAuditUsers } from "./service-helpers";

export const categoryService = {
    async list(pagination: PaginationOptions) {
        const where = { isActive: true };
        const [totalItems, data] = await Promise.all([
            prisma.category.count({ where }),
            prisma.category.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { name: "asc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const category = await prisma.category.findFirst({
            where: { id, isActive: true },
            include: { transportationServices: true },
        });

        if (!category) {
            throw AppError.notFound("Categoria no encontrada");
        }

        return category;
    },

    async create(data: CreateCategoryDto) {
        await validateAuditUsers(data);

        try {
            return await prisma.category.create({
                data: {
                    name: data.name,
                    description: data.description,
                    isAvailable: data.isAvailable,
                    createdById: data.createdById,
                    lastUpdatedById: lastUpdatedByOrCreator(data),
                },
            });
        } catch (error) {
            translatePrismaError(error, "categoria");
        }
    },

    async update(id: number, data: UpdateCategoryDto) {
        await this.getById(id);
        await validateAuditUsers(data);

        try {
            return await prisma.category.update({
                where: { id },
                data,
            });
        } catch (error) {
            translatePrismaError(error, "categoria");
        }
    },

    async delete(id: number) {
        await this.getById(id);

        return await prisma.category.update({
            where: { id },
            data: { isActive: false },
        });
    },
};
