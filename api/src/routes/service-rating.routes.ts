import { Router } from "express";
import { ServiceRatingController } from "../controllers/service-rating.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createServiceRatingSchema, updateServiceRatingSchema } from "../dtos/service-rating.dto";

export class ServiceRatingRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new ServiceRatingController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));
        router.post("/", validateRequest(createServiceRatingSchema), asyncHandler(controller.create));
        router.put("/:id", validateRequest(updateServiceRatingSchema), asyncHandler(controller.update));
        return router;
    }
}
