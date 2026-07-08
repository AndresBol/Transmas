import { z } from "zod";
import { auditCreateSchema, auditUpdateSchema, idSchema } from "./common.dto";

export const createTransportationServiceSpecialtySchema = z.object({
    transportationServiceId: idSchema,
    specialtyId: idSchema,
    isActive: z.boolean().optional(),
}).extend(auditCreateSchema.shape);

export const updateTransportationServiceSpecialtySchema = z.object({
    isActive: z.boolean().optional(),
}).extend(auditUpdateSchema.shape);

export type CreateTransportationServiceSpecialtyDto = z.infer<typeof createTransportationServiceSpecialtySchema>;
export type UpdateTransportationServiceSpecialtyDto = z.infer<typeof updateTransportationServiceSpecialtySchema>;
