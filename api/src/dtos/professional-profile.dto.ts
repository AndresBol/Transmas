import { z } from "zod";
import { Modality } from "../../generated/prisma";
import {
    emailSchema,
    idSchema,
    positiveDecimalSchema,
    requiredString,
    uniqueIdArraySchema,
} from "./common.dto";

export const createProfessionalProfileSchema = z.object({
    firstName: requiredString(100),
    lastName: requiredString(100),
    email: emailSchema,
    password: z.string().min(6).max(100),
    phoneNumber: requiredString(30),
    professionalTitle: requiredString(150),
    description: requiredString(500),
    experienceYears: z.number().int().min(0),
    modality: z.nativeEnum(Modality),
    baseRate: positiveDecimalSchema,
    isAvailable: z.boolean(),
    profilePictureUrl: requiredString(255).optional(),
    districtId: idSchema,
    specialtyIds: uniqueIdArraySchema,
}).strict();

export const updateProfessionalProfileSchema = createProfessionalProfileSchema
    .omit({ password: true })
    .partial();

export type CreateProfessionalProfileDto = z.infer<typeof createProfessionalProfileSchema>;
export type UpdateProfessionalProfileDto = z.infer<typeof updateProfessionalProfileSchema>;
