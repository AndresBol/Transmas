import { Router } from "express";
import { SpecialtyController } from "../controllers/specialty.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createSpecialtySchema, updateSpecialtySchema } from "../dtos/specialty.dto";

export class SpecialtyRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new SpecialtyController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));
        router.post("/", validateRequest(createSpecialtySchema), asyncHandler(controller.create));
        router.put("/:id", validateRequest(updateSpecialtySchema), asyncHandler(controller.update));
        router.delete("/:id", asyncHandler(controller.delete));

        return router;
    }
}
