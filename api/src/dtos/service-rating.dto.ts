import { z } from "zod";
import { idSchema, optionalNullableString } from "./common.dto";

export const createServiceRatingSchema = z.object({
    rating: z.number().int().min(1).max(5),
    description: optionalNullableString(500),
    reservationId: idSchema,
}).strict();

export const updateServiceRatingSchema = createServiceRatingSchema
    .omit({ reservationId: true })
    .partial();

export type CreateServiceRatingDto = z.infer<typeof createServiceRatingSchema>;
export type UpdateServiceRatingDto = z.infer<typeof updateServiceRatingSchema>;
