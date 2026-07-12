import { Router } from "express";
import { DistrictController } from "../controllers/district.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class DistrictRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new DistrictController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));

        return router;
    }
}
