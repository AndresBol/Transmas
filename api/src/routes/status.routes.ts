import { Router } from "express";
import { StatusController } from "../controllers/status.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createStatusSchema, updateStatusSchema } from "../dtos/status.dto";

export class StatusRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new StatusController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));
        router.post("/", validateRequest(createStatusSchema), asyncHandler(controller.create));
        router.put("/:id", validateRequest(updateStatusSchema), asyncHandler(controller.update));
        router.delete("/:id", asyncHandler(controller.delete));

        return router;
    }
}
