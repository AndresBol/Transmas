import { prisma } from "../config/prisma";
import { CreateTimelineDto, UpdateTimelineDto } from "../dtos/timeline.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { validateAuditUsers } from "./service-helpers";

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
            throw AppError.notFound("Linea de tiempo no encontrada");
        }

        return timeline;
    },

    async create(data: CreateTimelineDto) {
        await this.validateReservation(data.reservationId);
        await validateAuditUsers(data);

        try {
            return await prisma.timeline.create({
                data: {
                    subject: data.subject,
                    description: data.description,
                    reservationId: data.reservationId,
                    createdById: data.createdById,
                    lastUpdatedById: data.lastUpdatedById ?? data.createdById,
                },
                include: includeTimeline,
            });
        } catch (error) {
            translatePrismaError(error, "linea de tiempo");
        }
    },

    async update(id: number, data: UpdateTimelineDto) {
        await this.getById(id);
        await validateAuditUsers(data);

        try {
            return await prisma.timeline.update({
                where: { id },
                data,
                include: includeTimeline,
            });
        } catch (error) {
            translatePrismaError(error, "linea de tiempo");
        }
    },

    async delete(id: number) {
        await this.getById(id);

        return await prisma.timeline.update({
            where: { id },
            data: { isActive: false },
            include: includeTimeline,
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
