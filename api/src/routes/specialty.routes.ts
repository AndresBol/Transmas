import { Router } from "express";
import { SpecialtyController } from "../controllers/specialty.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createSpecialtySchema, updateSpecialtySchema } from "../dtos/specialty.dto";
import { availabilitySchema } from "../dtos/common.dto";

export class SpecialtyRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new SpecialtyController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));
        router.post("/", validateRequest(createSpecialtySchema), asyncHandler(controller.create));
        router.put("/:id", validateRequest(updateSpecialtySchema), asyncHandler(controller.update));
        router.patch(
            "/:id/availability",
            validateRequest(availabilitySchema),
            asyncHandler(controller.updateAvailability),
        );

        return router;
    }
}
