import { prisma } from "../config/prisma";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { getSeededAdministrator } from "./service-helpers";

export const categoryService = {
    async list(pagination: PaginationOptions) {
        const [totalItems, data] = await Promise.all([
            prisma.category.count({ where: { isActive: true } }),
            prisma.category.findMany({
                where: { isActive: true },
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
            include: {
                transportationServices: {
                    where: { isActive: true },
                },
            },
        });

        if (!category) {
            throw AppError.notFound("Category not found");
        }

        return category;
    },

    async create(data: CreateCategoryDto) {
        const administrator = await getSeededAdministrator();

        try {
            return await prisma.category.create({
                data: {
                    name: data.name,
                    description: data.description,
                    isAvailable: data.isAvailable,
                    createdById: administrator.id,
                    lastUpdatedById: administrator.id,
                },
            });
        } catch (error) {
            translatePrismaError(error, "category");
        }
    },

    async update(id: number, data: UpdateCategoryDto) {
        await this.getById(id);
        const administrator = await getSeededAdministrator();

        try {
            return await prisma.$transaction(async (transaction) => {
                const category = await transaction.category.update({
                    where: { id },
                    data: {
                        ...data,
                        lastUpdatedById: administrator.id,
                    },
                });

                if (data.isAvailable === false) {
                    await transaction.transportationService.updateMany({
                        where: { categoryId: id, isActive: true },
                        data: {
                            isAvailable: false,
                            lastUpdatedById: administrator.id,
                        },
                    });
                }

                return category;
            });
        } catch (error) {
            translatePrismaError(error, "category");
        }
    },

    async updateAvailability(id: number, isAvailable: boolean) {
        await this.getById(id);
        const administrator = await getSeededAdministrator();

        return prisma.$transaction(async (transaction) => {
            const category = await transaction.category.update({
                where: { id },
                data: {
                    isAvailable,
                    lastUpdatedById: administrator.id,
                },
            });

            if (!isAvailable) {
                await transaction.transportationService.updateMany({
                    where: { categoryId: id, isActive: true },
                    data: {
                        isAvailable: false,
                        lastUpdatedById: administrator.id,
                    },
                });
            }

            return category;
        });
    },
};
