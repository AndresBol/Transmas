import { z } from "zod";
import { requiredString } from "./common.dto";

export const createProvinceSchema = z.object({
    name: requiredString(100),
});

export const updateProvinceSchema = createProvinceSchema.partial();

export type CreateProvinceDto = z.infer<typeof createProvinceSchema>;
export type UpdateProvinceDto = z.infer<typeof updateProvinceSchema>;
