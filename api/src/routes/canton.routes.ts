import { Router } from "express";
import { CantonController } from "../controllers/canton.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class CantonRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new CantonController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));

        return router;
    }
}
