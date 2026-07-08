import { z } from "zod";
import { idSchema, requiredString } from "./common.dto";

export const createCantonSchema = z.object({
    name: requiredString(100),
    provinceId: idSchema,
});

export const updateCantonSchema = createCantonSchema.partial();

export type CreateCantonDto = z.infer<typeof createCantonSchema>;
export type UpdateCantonDto = z.infer<typeof updateCantonSchema>;
