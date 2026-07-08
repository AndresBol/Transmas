import { Role } from "../../generated/prisma";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

export const userSafeSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phoneNumber: true,
    role: true,
    isBlocked: true,
    isActive: true,
    createdOn: true,
    createdById: true,
    lastUpdatedOn: true,
    lastUpdatedById: true,
} as const;

export function lastUpdatedByOrCreator(data: {
    createdById: number;
    lastUpdatedById?: number;
}) {
    return data.lastUpdatedById ?? data.createdById;
}

export async function validateUser(userId: number, message = "El usuario indicado no existe") {
    const user = await prisma.user.findFirst({
        where: { id: userId, isActive: true },
    });

    if (!user) {
        throw AppError.badRequest(message);
    }

    return user;
}

export async function validateOptionalUser(userId?: number | null) {
    if (userId) {
        await validateUser(userId);
    }
}

export async function validateAuditUsers(data: {
    createdById?: number;
    lastUpdatedById?: number;
}) {
    if (data.createdById) {
        await validateUser(data.createdById, "El usuario creador indicado no existe");
    }

    if (data.lastUpdatedById) {
        await validateUser(data.lastUpdatedById, "El usuario actualizador indicado no existe");
    }
}

export async function validateClient(clientId: number) {
    const client = await prisma.user.findFirst({
        where: {
            id: clientId,
            role: Role.CLIENT,
            isActive: true,
            isBlocked: false,
        },
    });

    if (!client) {
        throw AppError.badRequest("El cliente indicado no existe o no esta disponible");
    }
}

export function validateDateRange(startDate: Date, endDate: Date) {
    if (endDate < startDate) {
        throw AppError.badRequest("La fecha final no puede ser anterior a la fecha inicial");
    }
}
