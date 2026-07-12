import { z } from "zod";
import { requiredString } from "./common.dto";

export const createSpecialtySchema = z.object({
    name: requiredString(100),
    description: requiredString(255),
    isAvailable: z.boolean(),
}).strict();

export const updateSpecialtySchema = createSpecialtySchema.partial();

export type CreateSpecialtyDto = z.infer<typeof createSpecialtySchema>;
export type UpdateSpecialtyDto = z.infer<typeof updateSpecialtySchema>;
