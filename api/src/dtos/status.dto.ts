import { z } from "zod";
import { auditCreateSchema, auditUpdateSchema, requiredString } from "./common.dto";

export const createStatusSchema = z.object({
    name: requiredString(100),
}).extend(auditCreateSchema.shape);

export const updateStatusSchema = createStatusSchema
    .omit({ createdById: true })
    .extend(auditUpdateSchema.shape)
    .partial();

export type CreateStatusDto = z.infer<typeof createStatusSchema>;
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
