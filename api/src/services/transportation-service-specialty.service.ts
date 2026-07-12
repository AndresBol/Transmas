import { prisma } from "../config/prisma";
import {
    CreateTransportationServiceSpecialtyDto,
    UpdateTransportationServiceSpecialtyDto,
} from "../dtos/transportation-service-specialty.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { getSeededAdministrator } from "./service-helpers";

const includeJoin = {
    transportationService: true,
    specialty: true,
} as const;

export const transportationServiceSpecialtyService = {
    async list(pagination: PaginationOptions) {
        const where = {
            isActive: true,
            transportationService: { isActive: true },
            specialty: { isActive: true },
        };
        const [totalItems, data] = await Promise.all([
            prisma.transportationServiceSpecialty.count({ where }),
            prisma.transportationServiceSpecialty.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: includeJoin,
                orderBy: { createdOn: "desc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(transportationServiceId: number, specialtyId: number) {
        const relation = await prisma.transportationServiceSpecialty.findFirst({
            where: {
                transportationServiceId,
                specialtyId,
                isActive: true,
                transportationService: { isActive: true },
                specialty: { isActive: true },
            },
            include: includeJoin,
        });

        if (!relation) {
            throw AppError.notFound("Transportation service specialty relationship not found");
        }

        return relation;
    },

    async create(data: CreateTransportationServiceSpecialtyDto) {
        await this.validateTransportationService(data.transportationServiceId);
        await this.validateSpecialty(data.specialtyId);
        const administrator = await getSeededAdministrator();

        try {
            return await prisma.transportationServiceSpecialty.upsert({
                where: {
                    transportationServiceId_specialtyId: {
                        transportationServiceId: data.transportationServiceId,
                        specialtyId: data.specialtyId,
                    },
                },
                create: {
                    transportationServiceId: data.transportationServiceId,
                    specialtyId: data.specialtyId,
                    isActive: data.isActive ?? true,
                    createdById: administrator.id,
                    lastUpdatedById: administrator.id,
                },
                update: {
                    isActive: data.isActive ?? true,
                    lastUpdatedById: administrator.id,
                },
                include: includeJoin,
            });
        } catch (error) {
            translatePrismaError(error, "transportation service specialty relationship");
        }
    },

    async update(
        transportationServiceId: number,
        specialtyId: number,
        data: UpdateTransportationServiceSpecialtyDto
    ) {
        await this.getById(transportationServiceId, specialtyId);
        const administrator = await getSeededAdministrator();

        try {
            return await prisma.transportationServiceSpecialty.update({
                where: {
                    transportationServiceId_specialtyId: {
                        transportationServiceId,
                        specialtyId,
                    },
                },
                data: { ...data, lastUpdatedById: administrator.id },
                include: includeJoin,
            });
        } catch (error) {
            translatePrismaError(error, "transportation service specialty relationship");
        }
    },

    async delete(transportationServiceId: number, specialtyId: number) {
        await this.getById(transportationServiceId, specialtyId);
        const administrator = await getSeededAdministrator();

        return await prisma.transportationServiceSpecialty.update({
            where: {
                transportationServiceId_specialtyId: {
                    transportationServiceId,
                    specialtyId,
                },
            },
            data: { isActive: false, lastUpdatedById: administrator.id },
            include: includeJoin,
        });
    },

    async validateTransportationService(transportationServiceId: number) {
        const exists = await prisma.transportationService.findFirst({
            where: { id: transportationServiceId, isActive: true, isAvailable: true },
        });

        if (!exists) {
            throw AppError.badRequest("The requested transportation service does not exist");
        }
    },

    async validateSpecialty(specialtyId: number) {
        const exists = await prisma.specialty.findFirst({
            where: { id: specialtyId, isActive: true, isAvailable: true },
        });

        if (!exists) {
            throw AppError.badRequest("The requested specialty does not exist");
        }
    },
};
