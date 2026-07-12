import { prisma } from "../config/prisma";
import { CreateReservationDto } from "../dtos/reservation.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import {
    getSeededAdministrator,
    userSafeSelect,
    validateClient,
    validateDateRange,
} from "./service-helpers";

const includeLocation = {
    canton: {
        include: { province: true },
    },
} as const;

const includeReservation = {
    client: { select: userSafeSelect },
    transportationService: {
        include: {
            category: true,
            professionalProfile: {
                include: {
                    professional: { select: userSafeSelect },
                    district: { include: includeLocation },
                    specialties: {
                        where: { isActive: true },
                        include: { specialty: true },
                    },
                },
            },
            specialties: {
                where: { isActive: true },
                include: { specialty: true },
            },
        },
    },
    pickupDistrict: { include: includeLocation },
    dropoffDistrict: { include: includeLocation },
    status: true,
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

    async getById(id: number) {
        const reservation = await prisma.reservation.findFirst({
            where: { id, isActive: true },
            include: includeReservation,
        });

        if (!reservation) {
            throw AppError.notFound("Reservation not found");
        }

        return reservation;
    },

    async create(data: CreateReservationDto) {
        validateDateRange(data.startDate, data.endDate);

        const [administrator, pendingStatus, service] = await Promise.all([
            getSeededAdministrator(),
            prisma.status.findFirst({
                where: { name: "Pending", isActive: true },
            }),
            this.validateReferences(data),
        ]);

        if (!pendingStatus) {
            throw AppError.internalServer(
                "The active Pending status is required before reservations can be created",
            );
        }

        if (service.professionalProfileId !== data.professionalProfileId) {
            throw AppError.badRequest(
                "The selected transportation service does not belong to the selected professional",
            );
        }

        if (
            service.modality !== data.modality
            || service.professionalProfile.modality !== data.modality
        ) {
            throw AppError.badRequest(
                "The reservation modality must match both the service and professional modality",
            );
        }

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
                    modality: data.modality,
                    professionalResponse: null,
                    quoteAmount: null,
                    clientId: data.clientId,
                    transportationServiceId: data.transportationServiceId,
                    pickupDistrictId: data.pickupDistrictId,
                    dropoffDistrictId: data.dropoffDistrictId,
                    statusId: pendingStatus.id,
                    createdById: administrator.id,
                    lastUpdatedById: administrator.id,
                },
                include: includeReservation,
            });
        } catch (error) {
            translatePrismaError(error, "reservation");
        }
    },

    async validateReferences(data: CreateReservationDto) {
        const [service] = await Promise.all([
            prisma.transportationService.findUnique({
                where: { id: data.transportationServiceId },
                include: {
                    category: true,
                    professionalProfile: {
                        include: { professional: true },
                    },
                },
            }),
            validateClient(data.clientId),
            this.validateDistrict(
                data.pickupDistrictId,
                "The selected pickup district does not exist",
            ),
            this.validateDistrict(
                data.dropoffDistrictId,
                "The selected drop-off district does not exist",
            ),
        ]);

        if (
            !service
            || !service.isActive
            || !service.isAvailable
            || !service.category.isActive
            || !service.category.isAvailable
            || !service.professionalProfile.isActive
            || !service.professionalProfile.isAvailable
            || !service.professionalProfile.professional.isActive
            || service.professionalProfile.professional.isBlocked
        ) {
            throw AppError.badRequest(
                "The selected service and professional must exist and be available",
            );
        }

        return service;
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
