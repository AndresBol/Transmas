import { z } from "zod";
import { idSchema } from "./common.dto";

export const createTransportationServiceSpecialtySchema = z.object({
    transportationServiceId: idSchema,
    specialtyId: idSchema,
    isActive: z.boolean().optional(),
}).strict();

export const updateTransportationServiceSpecialtySchema = z.object({
    isActive: z.boolean().optional(),
}).strict();

export type CreateTransportationServiceSpecialtyDto = z.infer<typeof createTransportationServiceSpecialtySchema>;
export type UpdateTransportationServiceSpecialtyDto = z.infer<typeof updateTransportationServiceSpecialtySchema>;
