import { z } from "zod";
import { auditCreateSchema, auditUpdateSchema, idSchema, optionalNullableString } from "./common.dto";

export const createServiceRatingSchema = z.object({
    rating: z.number().int().min(1).max(5),
    description: optionalNullableString(500),
    reservationId: idSchema,
}).extend(auditCreateSchema.shape);

export const updateServiceRatingSchema = createServiceRatingSchema
    .omit({ createdById: true, reservationId: true })
    .extend(auditUpdateSchema.shape)
    .partial();

export type CreateServiceRatingDto = z.infer<typeof createServiceRatingSchema>;
export type UpdateServiceRatingDto = z.infer<typeof updateServiceRatingSchema>;
