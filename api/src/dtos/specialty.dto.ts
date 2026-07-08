import { z } from "zod";
import { auditCreateSchema, auditUpdateSchema, requiredString } from "./common.dto";

export const createSpecialtySchema = z.object({
    name: requiredString(100),
    description: requiredString(255),
    isAvailable: z.boolean(),
}).extend(auditCreateSchema.shape);

export const updateSpecialtySchema = createSpecialtySchema
    .omit({ createdById: true })
    .extend(auditUpdateSchema.shape)
    .partial();

export type CreateSpecialtyDto = z.infer<typeof createSpecialtySchema>;
export type UpdateSpecialtyDto = z.infer<typeof updateSpecialtySchema>;
