import { Router } from "express";
import { TransportationServiceSpecialtyController } from "../controllers/transportation-service-specialty.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
    createTransportationServiceSpecialtySchema,
    updateTransportationServiceSpecialtySchema,
} from "../dtos/transportation-service-specialty.dto";

export class TransportationServiceSpecialtyRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new TransportationServiceSpecialtyController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:transportationServiceId/:specialtyId", asyncHandler(controller.getById));
        router.post("/", validateRequest(createTransportationServiceSpecialtySchema), asyncHandler(controller.create));
        router.put(
            "/:transportationServiceId/:specialtyId",
            validateRequest(updateTransportationServiceSpecialtySchema),
            asyncHandler(controller.update)
        );
        return router;
    }
}
