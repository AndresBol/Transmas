import { z } from "zod";
import { emailSchema, requiredString } from "./common.dto";

export const createUserSchema = z.object({
    firstName: requiredString(100),
    lastName: requiredString(100),
    email: emailSchema,
    password: z.string().min(6).max(100),
    phoneNumber: requiredString(30),
}).strict();

export const updateUserSchema = createUserSchema
    .omit({ password: true })
    .partial();

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
