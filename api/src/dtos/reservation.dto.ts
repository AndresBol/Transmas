import { z } from "zod";
import {
    auditCreateSchema,
    auditUpdateSchema,
    decimalSchema,
    idSchema,
    optionalNullableString,
    positiveDecimalSchema,
    requiredString,
} from "./common.dto";

export const createReservationSchema = z.object({
    description: requiredString(500),
    pickupLatitude: decimalSchema,
    pickupLongitude: decimalSchema,
    pickupAddress: requiredString(255),
    dropoffLatitude: decimalSchema,
    dropoffLongitude: decimalSchema,
    dropoffAddress: requiredString(255),
    passengerCount: z.number().int().positive(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    professionalResponse: optionalNullableString(500),
    quoteAmount: positiveDecimalSchema.nullable().optional(),
    clientId: idSchema,
    transportationServiceId: idSchema,
    pickupDistrictId: idSchema,
    dropoffDistrictId: idSchema,
    statusId: idSchema,
}).extend(auditCreateSchema.shape);

export const updateReservationSchema = createReservationSchema
    .omit({ createdById: true })
    .extend(auditUpdateSchema.shape)
    .partial();

export type CreateReservationDto = z.infer<typeof createReservationSchema>;
export type UpdateReservationDto = z.infer<typeof updateReservationSchema>;
