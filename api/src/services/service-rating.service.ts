import { prisma } from "../config/prisma";
import { CreateServiceRatingDto, UpdateServiceRatingDto } from "../dtos/service-rating.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { lastUpdatedByOrCreator, validateAuditUsers } from "./service-helpers";

const includeServiceRating = {
    reservation: true,
} as const;

export const serviceRatingService = {
    async list(pagination: PaginationOptions) {
        const where = { isActive: true };
        const [totalItems, data] = await Promise.all([
            prisma.serviceRating.count({ where }),
            prisma.serviceRating.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: includeServiceRating,
                orderBy: { createdOn: "desc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const rating = await prisma.serviceRating.findFirst({
            where: { id, isActive: true },
            include: includeServiceRating,
        });

        if (!rating) {
            throw AppError.notFound("Calificacion de servicio no encontrada");
        }

        return rating;
    },

    async create(data: CreateServiceRatingDto) {
        await this.validateReservation(data.reservationId);
        await validateAuditUsers(data);

        const existing = await prisma.serviceRating.findUnique({
            where: { reservationId: data.reservationId },
        });

        if (existing) {
            throw AppError.conflict("La reservacion indicada ya tiene una calificacion");
        }

        try {
            return await prisma.serviceRating.create({
                data: {
                    rating: data.rating,
                    description: data.description,
                    reservationId: data.reservationId,
                    createdById: data.createdById,
                    lastUpdatedById: lastUpdatedByOrCreator(data),
                },
                include: includeServiceRating,
            });
        } catch (error) {
            translatePrismaError(error, "calificacion de servicio");
        }
    },

    async update(id: number, data: UpdateServiceRatingDto) {
        await this.getById(id);
        await validateAuditUsers(data);

        try {
            return await prisma.serviceRating.update({
                where: { id },
                data,
                include: includeServiceRating,
            });
        } catch (error) {
            translatePrismaError(error, "calificacion de servicio");
        }
    },

    async delete(id: number) {
        await this.getById(id);

        return await prisma.serviceRating.update({
            where: { id },
            data: { isActive: false },
            include: includeServiceRating,
        });
    },

    async validateReservation(reservationId: number) {
        const reservation = await prisma.reservation.findFirst({
            where: { id: reservationId, isActive: true },
        });

        if (!reservation) {
            throw AppError.badRequest("La reservacion indicada no existe");
        }
    },
};
