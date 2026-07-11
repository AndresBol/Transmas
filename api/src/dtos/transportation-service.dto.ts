import { z } from "zod";
import { Modality } from "../../generated/prisma";
import {
    idSchema,
    positiveDecimalSchema,
    requiredString,
    uniqueIdArraySchema,
} from "./common.dto";

export const createTransportationServiceSchema = z.object({
    name: requiredString(150),
    description: requiredString(500),
    price: positiveDecimalSchema,
    estimatedDuration: z.number().int().positive(),
    modality: z.nativeEnum(Modality),
    isAvailable: z.boolean(),
    professionalProfileId: idSchema,
    categoryId: idSchema,
    specialtyIds: uniqueIdArraySchema,
}).strict();

export const updateTransportationServiceSchema = createTransportationServiceSchema.partial();

export type CreateTransportationServiceDto = z.infer<typeof createTransportationServiceSchema>;
export type UpdateTransportationServiceDto = z.infer<typeof updateTransportationServiceSchema>;
