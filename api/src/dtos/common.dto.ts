import { z } from "zod";

export const idSchema = z.number().int().positive();
export const requiredString = (max = 255) => z.string().trim().min(1).max(max);
export const optionalString = (max = 255) => z.string().trim().max(max).optional();
export const optionalNullableString = (max = 255) => z.string().trim().max(max).nullable().optional();
export const decimalSchema = z.number();
export const positiveDecimalSchema = z.number().positive();
export const auditCreateSchema = z.object({
    createdById: idSchema,
    lastUpdatedById: idSchema.optional(),
});
export const auditUpdateSchema = z.object({
    lastUpdatedById: idSchema.optional(),
});
