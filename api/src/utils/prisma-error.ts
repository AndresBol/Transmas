import { Prisma } from "../../generated/prisma/client";
import { AppError } from "./app-error";

export function translatePrismaError(error: unknown, entityName = "resource"): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            throw AppError.conflict(`A ${entityName} with those unique values already exists`);
        }

        if (error.code === "P2003") {
            throw AppError.conflict(
                `The ${entityName} cannot be modified because it has active relationships`,
            );
        }

        if (error.code === "P2025") {
            throw AppError.notFound(`${entityName} not found`);
        }
    }

    throw error;
}
