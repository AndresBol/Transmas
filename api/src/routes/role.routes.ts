import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class RoleRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new RoleController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));

        return router;
    }
}
