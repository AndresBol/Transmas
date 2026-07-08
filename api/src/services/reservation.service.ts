import { Role } from "../../generated/prisma";
import { prisma } from "../config/prisma";
import { CreateReservationDto, UpdateReservationDto } from "../dtos/reservation.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import {
    lastUpdatedByOrCreator,
    userSafeSelect,
    validateAuditUsers,
    validateClient,
    validateDateRange,
} from "./service-helpers";

const includeReservation = {
    client: { select: userSafeSelect },
    transportationService: true,
    pickupDistrict: true,
    dropoffDistrict: true,
    status: true,
    serviceRating: true,
    timelines: true,
} as const;

export const reservationService = {
    async list(pagination: PaginationOptions) {
        const where = { isActive: true };
        const [totalItems, data] = await Promise.all([
            prisma.reservation.count({ where }),
            prisma.reservation.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: includeReservation,
                orderBy: { startDate: "desc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async listByUser(clientId: number, role: Role, pagination: PaginationOptions) {
        const where = role === Role.ADMIN
            ? { isActive: true }
            : { isActive: true, clientId };

        const [totalItems, data] = await Promise.all([
            prisma.reservation.count({ where }),
            prisma.reservation.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: includeReservation,
                orderBy: { startDate: "desc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const reservation = await prisma.reservation.findFirst({
            where: { id, isActive: true },
            include: includeReservation,
        });

        if (!reservation) {
            throw AppError.notFound("Reservacion no encontrada");
        }

        return reservation;
    },

    async create(data: CreateReservationDto) {
        await this.validateReferences(data);
        validateDateRange(data.startDate, data.endDate);
        await validateAuditUsers(data);

        try {
            return await prisma.reservation.create({
                data: {
                    description: data.description,
                    pickupLatitude: data.pickupLatitude,
                    pickupLongitude: data.pickupLongitude,
                    pickupAddress: data.pickupAddress,
                    dropoffLatitude: data.dropoffLatitude,
                    dropoffLongitude: data.dropoffLongitude,
                    dropoffAddress: data.dropoffAddress,
                    passengerCount: data.passengerCount,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    professionalResponse: data.professionalResponse,
                    quoteAmount: data.quoteAmount,
                    clientId: data.clientId,
                    transportationServiceId: data.transportationServiceId,
                    pickupDistrictId: data.pickupDistrictId,
                    dropoffDistrictId: data.dropoffDistrictId,
                    statusId: data.statusId,
                    createdById: data.createdById,
                    lastUpdatedById: lastUpdatedByOrCreator(data),
                },
                include: includeReservation,
            });
        } catch (error) {
            translatePrismaError(error, "reservacion");
        }
    },

    async update(id: number, data: UpdateReservationDto) {
        const current = await this.getById(id);
        await this.validateReferences(data);
        await validateAuditUsers(data);

        const startDate = data.startDate ?? current.startDate;
        const endDate = data.endDate ?? current.endDate;
        validateDateRange(startDate, endDate);

        try {
            return await prisma.reservation.update({
                where: { id },
                data: {
                    description: data.description,
                    pickupLatitude: data.pickupLatitude,
                    pickupLongitude: data.pickupLongitude,
                    pickupAddress: data.pickupAddress,
                    dropoffLatitude: data.dropoffLatitude,
                    dropoffLongitude: data.dropoffLongitude,
                    dropoffAddress: data.dropoffAddress,
                    passengerCount: data.passengerCount,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    professionalResponse: data.professionalResponse,
                    quoteAmount: data.quoteAmount,
                    clientId: data.clientId,
                    transportationServiceId: data.transportationServiceId,
                    pickupDistrictId: data.pickupDistrictId,
                    dropoffDistrictId: data.dropoffDistrictId,
                    statusId: data.statusId,
                    lastUpdatedById: data.lastUpdatedById,
                },
                include: includeReservation,
            });
        } catch (error) {
            translatePrismaError(error, "reservacion");
        }
    },

    async delete(id: number) {
        await this.getById(id);

        return await prisma.reservation.update({
            where: { id },
            data: { isActive: false },
            include: includeReservation,
        });
    },

    async validateReferences(data: Partial<CreateReservationDto>) {
        if (data.clientId) {
            await validateClient(data.clientId);
        }

        if (data.transportationServiceId) {
            const service = await prisma.transportationService.findFirst({
                where: { id: data.transportationServiceId, isActive: true },
            });

            if (!service) {
                throw AppError.badRequest("El servicio de transporte indicado no existe");
            }
        }

        if (data.pickupDistrictId) {
            await this.validateDistrict(data.pickupDistrictId, "El distrito de salida indicado no existe");
        }

        if (data.dropoffDistrictId) {
            await this.validateDistrict(data.dropoffDistrictId, "El distrito de destino indicado no existe");
        }

        if (data.statusId) {
            const status = await prisma.status.findFirst({
                where: { id: data.statusId, isActive: true },
            });

            if (!status) {
                throw AppError.badRequest("El estado indicado no existe");
            }
        }
    },

    async validateDistrict(districtId: number, message: string) {
        const district = await prisma.district.findUnique({
            where: { id: districtId },
        });

        if (!district) {
            throw AppError.badRequest(message);
        }
    },
};
