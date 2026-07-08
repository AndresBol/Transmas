import { z } from "zod";
import { auditCreateSchema, auditUpdateSchema, idSchema } from "./common.dto";

export const createProfessionalProfileSpecialtySchema = z.object({
    professionalProfileId: idSchema,
    specialtyId: idSchema,
    isActive: z.boolean().optional(),
}).extend(auditCreateSchema.shape);

export const updateProfessionalProfileSpecialtySchema = z.object({
    isActive: z.boolean().optional(),
}).extend(auditUpdateSchema.shape);

export type CreateProfessionalProfileSpecialtyDto = z.infer<typeof createProfessionalProfileSpecialtySchema>;
export type UpdateProfessionalProfileSpecialtyDto = z.infer<typeof updateProfessionalProfileSpecialtySchema>;
