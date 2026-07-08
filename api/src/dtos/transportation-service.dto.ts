import { z } from "zod";
import {
    auditCreateSchema,
    auditUpdateSchema,
    idSchema,
    positiveDecimalSchema,
    requiredString,
} from "./common.dto";

export const createTransportationServiceSchema = z.object({
    name: requiredString(150),
    description: requiredString(500),
    price: positiveDecimalSchema,
    estimatedDuration: z.number().int().positive(),
    isAvailable: z.boolean(),
    professionalProfileId: idSchema,
    categoryId: idSchema,
    specialtyIds: z.array(idSchema).optional(),
}).extend(auditCreateSchema.shape);

export const updateTransportationServiceSchema = createTransportationServiceSchema
    .omit({ createdById: true })
    .extend(auditUpdateSchema.shape)
    .partial();

export type CreateTransportationServiceDto = z.infer<typeof createTransportationServiceSchema>;
export type UpdateTransportationServiceDto = z.infer<typeof updateTransportationServiceSchema>;
