import { z } from "zod";
import { auditCreateSchema, auditUpdateSchema, requiredString } from "./common.dto";

export const createCategorySchema = z.object({
    name: requiredString(100),
    description: requiredString(255),
    isAvailable: z.boolean(),
}).extend(auditCreateSchema.shape);

export const updateCategorySchema = createCategorySchema
    .omit({ createdById: true })
    .extend(auditUpdateSchema.shape)
    .partial();

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
