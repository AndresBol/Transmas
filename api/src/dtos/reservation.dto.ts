import { z } from "zod";
import { Modality } from "../../generated/prisma";
import {
    idSchema,
    requiredString,
} from "./common.dto";

export const createReservationSchema = z.object({
    description: requiredString(500),
    pickupLatitude: z.number().min(-90).max(90),
    pickupLongitude: z.number().min(-180).max(180),
    pickupAddress: requiredString(255),
    dropoffLatitude: z.number().min(-90).max(90),
    dropoffLongitude: z.number().min(-180).max(180),
    dropoffAddress: requiredString(255),
    passengerCount: z.number().int().positive(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    modality: z.nativeEnum(Modality),
    clientId: idSchema,
    professionalProfileId: idSchema,
    transportationServiceId: idSchema,
    pickupDistrictId: idSchema,
    dropoffDistrictId: idSchema,
}).strict();

export type CreateReservationDto = z.infer<typeof createReservationSchema>;
