import { Router } from "express";
import { TransportationServiceController } from "../controllers/transportation-service.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
    createTransportationServiceSchema,
    updateTransportationServiceSchema,
} from "../dtos/transportation-service.dto";
import { availabilitySchema } from "../dtos/common.dto";

export class TransportationServiceRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new TransportationServiceController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));
        router.post("/", validateRequest(createTransportationServiceSchema), asyncHandler(controller.create));
        router.put("/:id", validateRequest(updateTransportationServiceSchema), asyncHandler(controller.update));
        router.patch(
            "/:id/availability",
            validateRequest(availabilitySchema),
            asyncHandler(controller.updateAvailability),
        );

        return router;
    }
}
