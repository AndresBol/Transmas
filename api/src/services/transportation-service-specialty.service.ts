import { prisma } from "../config/prisma";
import {
    CreateTransportationServiceSpecialtyDto,
    UpdateTransportationServiceSpecialtyDto,
} from "../dtos/transportation-service-specialty.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { lastUpdatedByOrCreator, validateAuditUsers } from "./service-helpers";

const includeJoin = {
    transportationService: true,
    specialty: true,
} as const;

export const transportationServiceSpecialtyService = {
    async list(pagination: PaginationOptions) {
        const where = { isActive: true };
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
            },
            include: includeJoin,
        });

        if (!relation) {
            throw AppError.notFound("Relacion de servicio de transporte y especialidad no encontrada");
        }

        return relation;
    },

    async create(data: CreateTransportationServiceSpecialtyDto) {
        await this.validateTransportationService(data.transportationServiceId);
        await this.validateSpecialty(data.specialtyId);
        await validateAuditUsers(data);

        try {
            return await prisma.transportationServiceSpecialty.create({
                data: {
                    transportationServiceId: data.transportationServiceId,
                    specialtyId: data.specialtyId,
                    isActive: data.isActive,
                    createdById: data.createdById,
                    lastUpdatedById: lastUpdatedByOrCreator(data),
                },
                include: includeJoin,
            });
        } catch (error) {
            translatePrismaError(error, "relacion de servicio de transporte y especialidad");
        }
    },

    async update(
        transportationServiceId: number,
        specialtyId: number,
        data: UpdateTransportationServiceSpecialtyDto
    ) {
        await this.getById(transportationServiceId, specialtyId);
        await validateAuditUsers(data);

        try {
            return await prisma.transportationServiceSpecialty.update({
                where: {
                    transportationServiceId_specialtyId: {
                        transportationServiceId,
                        specialtyId,
                    },
                },
                data,
                include: includeJoin,
            });
        } catch (error) {
            translatePrismaError(error, "relacion de servicio de transporte y especialidad");
        }
    },

    async delete(transportationServiceId: number, specialtyId: number) {
        await this.getById(transportationServiceId, specialtyId);

        return await prisma.transportationServiceSpecialty.update({
            where: {
                transportationServiceId_specialtyId: {
                    transportationServiceId,
                    specialtyId,
                },
            },
            data: { isActive: false },
            include: includeJoin,
        });
    },

    async validateTransportationService(transportationServiceId: number) {
        const exists = await prisma.transportationService.findFirst({
            where: { id: transportationServiceId, isActive: true },
        });

        if (!exists) {
            throw AppError.badRequest("El servicio de transporte indicado no existe");
        }
    },

    async validateSpecialty(specialtyId: number) {
        const exists = await prisma.specialty.findFirst({
            where: { id: specialtyId, isActive: true },
        });

        if (!exists) {
            throw AppError.badRequest("La especialidad indicada no existe");
        }
    },
};
