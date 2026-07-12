import { z } from "zod";
import { requiredString } from "./common.dto";

export const createCategorySchema = z.object({
    name: requiredString(100),
    description: requiredString(255),
    isAvailable: z.boolean(),
}).strict();

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
