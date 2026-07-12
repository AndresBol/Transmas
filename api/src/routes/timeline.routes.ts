import { Router } from "express";
import { TimelineController } from "../controllers/timeline.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createTimelineSchema, updateTimelineSchema } from "../dtos/timeline.dto";

export class TimelineRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new TimelineController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));
        router.post("/", validateRequest(createTimelineSchema), asyncHandler(controller.create));
        router.put("/:id", validateRequest(updateTimelineSchema), asyncHandler(controller.update));
        return router;
    }
}
