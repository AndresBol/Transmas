import { z } from "zod";
import { idSchema, optionalString, requiredString } from "./common.dto";

export const createTimelineSchema = z.object({
    subject: requiredString(150),
    description: requiredString(500),
    reservationId: idSchema,
}).strict();

export const updateTimelineSchema = createTimelineSchema
    .partial();

export type CreateTimelineDto = z.infer<typeof createTimelineSchema>;
export type UpdateTimelineDto = z.infer<typeof updateTimelineSchema>;
