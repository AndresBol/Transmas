import { prisma } from "../config/prisma";
import { CreateServiceRatingDto, UpdateServiceRatingDto } from "../dtos/service-rating.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { getSeededAdministrator } from "./service-helpers";

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
            throw AppError.notFound("Service rating not found");
        }

        return rating;
    },

    async create(data: CreateServiceRatingDto) {
        await this.validateReservation(data.reservationId);
        const administrator = await getSeededAdministrator();

        const existing = await prisma.serviceRating.findUnique({
            where: { reservationId: data.reservationId },
        });

        if (existing) {
            throw AppError.conflict("The requested reservation already has a rating");
        }

        try {
            return await prisma.serviceRating.create({
                data: {
                    rating: data.rating,
                    description: data.description,
                    reservationId: data.reservationId,
                    createdById: administrator.id,
                    lastUpdatedById: administrator.id,
                },
                include: includeServiceRating,
            });
        } catch (error) {
            translatePrismaError(error, "service rating");
        }
    },

    async update(id: number, data: UpdateServiceRatingDto) {
        await this.getById(id);
        const administrator = await getSeededAdministrator();

        try {
            return await prisma.serviceRating.update({
                where: { id },
                data: { ...data, lastUpdatedById: administrator.id },
                include: includeServiceRating,
            });
        } catch (error) {
            translatePrismaError(error, "service rating");
        }
    },

    async delete(id: number) {
        await this.getById(id);
        const administrator = await getSeededAdministrator();

        return await prisma.serviceRating.update({
            where: { id },
            data: { isActive: false, lastUpdatedById: administrator.id },
            include: includeServiceRating,
        });
    },

    async validateReservation(reservationId: number) {
        const reservation = await prisma.reservation.findFirst({
            where: { id: reservationId, isActive: true },
        });

        if (!reservation) {
            throw AppError.badRequest("The requested reservation does not exist");
        }
    },
};
