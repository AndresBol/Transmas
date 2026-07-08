import { prisma } from "../config/prisma";
import { CreateStatusDto, UpdateStatusDto } from "../dtos/status.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { lastUpdatedByOrCreator, validateAuditUsers } from "./service-helpers";

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
            throw AppError.notFound("Estado no encontrado");
        }

        return status;
    },

    async create(data: CreateStatusDto) {
        await validateAuditUsers(data);

        try {
            return await prisma.status.create({
                data: {
                    name: data.name,
                    createdById: data.createdById,
                    lastUpdatedById: lastUpdatedByOrCreator(data),
                },
            });
        } catch (error) {
            translatePrismaError(error, "estado");
        }
    },

    async update(id: number, data: UpdateStatusDto) {
        await this.getById(id);
        await validateAuditUsers(data);

        try {
            return await prisma.status.update({
                where: { id },
                data,
            });
        } catch (error) {
            translatePrismaError(error, "estado");
        }
    },

    async delete(id: number) {
        await this.getById(id);

        return await prisma.status.update({
            where: { id },
            data: { isActive: false },
        });
    },
};
