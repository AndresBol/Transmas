import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createCategorySchema, updateCategorySchema } from "../dtos/category.dto";
import { availabilitySchema } from "../dtos/common.dto";

export class CategoryRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new CategoryController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));
        router.post("/", validateRequest(createCategorySchema), asyncHandler(controller.create));
        router.put("/:id", validateRequest(updateCategorySchema), asyncHandler(controller.update));
        router.patch(
            "/:id/availability",
            validateRequest(availabilitySchema),
            asyncHandler(controller.updateAvailability),
        );

        return router;
    }
}
