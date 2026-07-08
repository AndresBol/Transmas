import { z } from "zod";
import {
    auditCreateSchema,
    auditUpdateSchema,
    idSchema,
    positiveDecimalSchema,
    requiredString,
} from "./common.dto";

export const createProfessionalProfileSchema = z.object({
    professionalTitle: requiredString(150),
    description: requiredString(500),
    experienceYears: z.number().int().min(0),
    baseRate: positiveDecimalSchema,
    isAvailable: z.boolean(),
    profilePictureUrl: requiredString(255).optional(),
    professionalId: idSchema,
    districtId: idSchema,
    specialtyIds: z.array(idSchema).optional(),
}).extend(auditCreateSchema.shape);

export const updateProfessionalProfileSchema = createProfessionalProfileSchema
    .omit({ createdById: true })
    .extend(auditUpdateSchema.shape)
    .partial();

export type CreateProfessionalProfileDto = z.infer<typeof createProfessionalProfileSchema>;
export type UpdateProfessionalProfileDto = z.infer<typeof updateProfessionalProfileSchema>;
