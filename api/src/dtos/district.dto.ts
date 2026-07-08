import { z } from "zod";
import { idSchema, requiredString } from "./common.dto";

export const createDistrictSchema = z.object({
    name: requiredString(100),
    cantonId: idSchema,
});

export const updateDistrictSchema = createDistrictSchema.partial();

export type CreateDistrictDto = z.infer<typeof createDistrictSchema>;
export type UpdateDistrictDto = z.infer<typeof updateDistrictSchema>;
