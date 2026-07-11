import { z } from "zod";
import { idSchema } from "./common.dto";

export const createProfessionalProfileSpecialtySchema = z.object({
    professionalProfileId: idSchema,
    specialtyId: idSchema,
    isActive: z.boolean().optional(),
}).strict();

export const updateProfessionalProfileSpecialtySchema = z.object({
    isActive: z.boolean().optional(),
}).strict();

export type CreateProfessionalProfileSpecialtyDto = z.infer<typeof createProfessionalProfileSpecialtySchema>;
export type UpdateProfessionalProfileSpecialtyDto = z.infer<typeof updateProfessionalProfileSpecialtySchema>;
