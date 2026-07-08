import { z } from "zod";
import { Role } from "../../generated/prisma";
import { idSchema, optionalString, requiredString } from "./common.dto";

export const createUserSchema = z.object({
    firstName: requiredString(100),
    lastName: requiredString(100),
    email: z.string().trim().pipe(z.email().max(150)),
    password: z.string().min(6).max(100),
    phoneNumber: requiredString(30),
    role: z.nativeEnum(Role).optional(),
    isBlocked: z.boolean().optional(),
    isActive: z.boolean().optional(),
    createdById: idSchema.optional(),
    lastUpdatedById: idSchema.optional(),
});

export const updateUserSchema = createUserSchema
    .omit({ createdById: true })
    .extend({
        password: z.string().min(6).max(100).optional(),
        lastUpdatedById: idSchema.optional(),
    })
    .partial();

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
