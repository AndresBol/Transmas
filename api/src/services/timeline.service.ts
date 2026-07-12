import { prisma } from "../config/prisma";
import { CreateTimelineDto, UpdateTimelineDto } from "../dtos/timeline.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { getSeededAdministrator } from "./service-helpers";

const includeTimeline = {
    reservation: true,
} as const;

export const timelineService = {
    async list(pagination: PaginationOptions) {
        const where = { isActive: true };
        const [totalItems, data] = await Promise.all([
            prisma.timeline.count({ where }),
            prisma.timeline.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: includeTimeline,
                orderBy: { createdOn: "desc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const timeline = await prisma.timeline.findFirst({
            where: { id, isActive: true },
            include: includeTimeline,
        });

        if (!timeline) {
            throw AppError.notFound("Timeline entry not found");
        }

        return timeline;
    },

    async create(data: CreateTimelineDto) {
        await this.validateReservation(data.reservationId);
        const administrator = await getSeededAdministrator();

        try {
            return await prisma.timeline.create({
                data: {
                    subject: data.subject,
                    description: data.description,
                    reservationId: data.reservationId,
                    createdById: administrator.id,
                    lastUpdatedById: administrator.id,
                },
                include: includeTimeline,
            });
        } catch (error) {
            translatePrismaError(error, "timeline entry");
        }
    },

    async update(id: number, data: UpdateTimelineDto) {
        await this.getById(id);
        const administrator = await getSeededAdministrator();

        try {
            return await prisma.timeline.update({
                where: { id },
                data: { ...data, lastUpdatedById: administrator.id },
                include: includeTimeline,
            });
        } catch (error) {
            translatePrismaError(error, "timeline entry");
        }
    },

    async delete(id: number) {
        await this.getById(id);
        const administrator = await getSeededAdministrator();

        return await prisma.timeline.update({
            where: { id },
            data: { isActive: false, lastUpdatedById: administrator.id },
            include: includeTimeline,
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
