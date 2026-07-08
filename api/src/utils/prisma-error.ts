import { Prisma } from "../../generated/prisma/client";
import { AppError } from "./app-error";

export function translatePrismaError(error: unknown, entityName = "recurso"): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            throw AppError.conflict(`Ya existe un ${entityName} con esos datos unicos`);
        }

        if (error.code === "P2003") {
            throw AppError.conflict(`No se puede eliminar o modificar el ${entityName} porque tiene relaciones activas`);
        }

        if (error.code === "P2025") {
            throw AppError.notFound(`${entityName} no encontrado`);
        }
    }

    throw error;
}
