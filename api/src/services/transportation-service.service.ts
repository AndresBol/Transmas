import { prisma } from "../config/prisma";
import {
    CreateTransportationServiceDto,
    UpdateTransportationServiceDto,
} from "../dtos/transportation-service.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { lastUpdatedByOrCreator, validateAuditUsers } from "./service-helpers";

const includeTransportationService = {
    professionalProfile: true,
    category: true,
    specialties: {
        where: { isActive: true },
        include: { specialty: true },
    },
} as const;

export const transportationServiceService = {
    async list(pagination: PaginationOptions) {
        const where = { isActive: true };
        const [totalItems, data] = await Promise.all([
            prisma.transportationService.count({ where }),
            prisma.transportationService.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: includeTransportationService,
                orderBy: { createdOn: "desc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const service = await prisma.transportationService.findFirst({
            where: { id, isActive: true },
            include: includeTransportationService,
        });

        if (!service) {
            throw AppError.notFound("Servicio de transporte no encontrado");
        }

        return service;
    },

    async create(data: CreateTransportationServiceDto) {
        await this.validateProfessionalProfile(data.professionalProfileId);
        await this.validateCategory(data.categoryId);
        await this.validateSpecialties(data.specialtyIds);
        await validateAuditUsers(data);

        const lastUpdatedById = lastUpdatedByOrCreator(data);

        try {
            return await prisma.transportationService.create({
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    estimatedDuration: data.estimatedDuration,
                    isAvailable: data.isAvailable,
                    professionalProfileId: data.professionalProfileId,
                    categoryId: data.categoryId,
                    createdById: data.createdById,
                    lastUpdatedById,
                    specialties: data.specialtyIds?.length
                        ? {
                            create: data.specialtyIds.map((specialtyId) => ({
                                specialtyId,
                                createdById: data.createdById,
                                lastUpdatedById,
                            })),
                        }
                        : undefined,
                },
                include: includeTransportationService,
            });
        } catch (error) {
            translatePrismaError(error, "servicio de transporte");
        }
    },

    async update(id: number, data: UpdateTransportationServiceDto) {
        const current = await this.getById(id);

        if (data.professionalProfileId) {
            await this.validateProfessionalProfile(data.professionalProfileId);
        }

        if (data.categoryId) {
            await this.validateCategory(data.categoryId);
        }

        await this.validateSpecialties(data.specialtyIds);
        await validateAuditUsers(data);

        const auditUserId = data.lastUpdatedById ?? current.lastUpdatedById;

        try {
            return await prisma.transportationService.update({
                where: { id },
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    estimatedDuration: data.estimatedDuration,
                    isAvailable: data.isAvailable,
                    professionalProfileId: data.professionalProfileId,
                    categoryId: data.categoryId,
                    lastUpdatedById: data.lastUpdatedById,
                    specialties: data.specialtyIds
                        ? {
                            deleteMany: {},
                            create: data.specialtyIds.map((specialtyId) => ({
                                specialtyId,
                                createdById: current.createdById,
                                lastUpdatedById: auditUserId,
                            })),
                        }
                        : undefined,
                },
                include: includeTransportationService,
            });
        } catch (error) {
            translatePrismaError(error, "servicio de transporte");
        }
    },

    async delete(id: number) {
        await this.getById(id);

        return await prisma.transportationService.update({
            where: { id },
            data: { isActive: false },
            include: includeTransportationService,
        });
    },

    async validateProfessionalProfile(professionalProfileId: number) {
        const profile = await prisma.professionalProfile.findFirst({
            where: { id: professionalProfileId, isActive: true },
        });

        if (!profile) {
            throw AppError.badRequest("El perfil profesional indicado no existe");
        }
    },

    async validateCategory(categoryId: number) {
        const category = await prisma.category.findFirst({
            where: { id: categoryId, isActive: true },
        });

        if (!category) {
            throw AppError.badRequest("La categoria indicada no existe");
        }
    },

    async validateSpecialties(specialtyIds?: number[]) {
        if (!specialtyIds?.length) {
            return;
        }

        const uniqueIds = [...new Set(specialtyIds)];

        if (uniqueIds.length !== specialtyIds.length) {
            throw AppError.badRequest("La lista de especialidades contiene valores repetidos");
        }

        const count = await prisma.specialty.count({
            where: {
                id: { in: uniqueIds },
                isActive: true,
            },
        });

        if (count !== uniqueIds.length) {
            throw AppError.badRequest("Una o mas especialidades no existen");
        }
    },
};
