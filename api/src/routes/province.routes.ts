import { Router } from "express";
import { ProvinceController } from "../controllers/province.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class ProvinceRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new ProvinceController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));

        return router;
    }
}
