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
    lastUpdatedOn: true,
} as const;

export const SEEDED_ADMIN_EMAIL = "admin@transmas.com";

export async function getSeededAdministrator() {
    const administrator = await prisma.user.findFirst({
        where: {
            email: SEEDED_ADMIN_EMAIL,
            role: Role.ADMIN,
            isActive: true,
        },
        select: { id: true },
    });

    if (!administrator) {
        throw AppError.internalServer(
            `The active seeded administrator ${SEEDED_ADMIN_EMAIL} is required to populate audit fields`,
        );
    }

    return administrator;
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
        throw AppError.badRequest("The requested client does not exist or is unavailable");
    }
}

export function validateDateRange(startDate: Date, endDate: Date) {
    if (startDate <= new Date()) {
        throw AppError.badRequest("The reservation start date must be in the future");
    }

    if (endDate <= startDate) {
        throw AppError.badRequest("The reservation end date must be after its start date");
    }
}
