import { z } from "zod";

export const idSchema = z.number().int().positive();
export const requiredString = (max = 255) => z.string().trim().min(1).max(max);
export const optionalString = (max = 255) => z.string().trim().max(max).optional();
export const optionalNullableString = (max = 255) => z.string().trim().max(max).nullable().optional();
export const decimalSchema = z.number();
export const positiveDecimalSchema = z.number().positive();
export const emailSchema = z.string().trim().pipe(z.email().max(150));
export const uniqueIdArraySchema = z.array(idSchema).refine(
    (ids) => new Set(ids).size === ids.length,
    "Specialty IDs must be unique",
);
export const availabilitySchema = z.object({
    isAvailable: z.boolean(),
}).strict();
export const blockedStatusSchema = z.object({
    isBlocked: z.boolean(),
}).strict();
