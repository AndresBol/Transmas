import { Router } from "express";
import { CantonController } from "../controllers/canton.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createCantonSchema, updateCantonSchema } from "../dtos/canton.dto";

export class CantonRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new CantonController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));
        router.post("/", validateRequest(createCantonSchema), asyncHandler(controller.create));
        router.put("/:id", validateRequest(updateCantonSchema), asyncHandler(controller.update));
        router.delete("/:id", asyncHandler(controller.delete));

        return router;
    }
}
