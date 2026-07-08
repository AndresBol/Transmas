import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createUserSchema, updateUserSchema } from "../dtos/user.dto";

export class UserRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new UserController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));
        router.post("/", validateRequest(createUserSchema), asyncHandler(controller.create));
        router.put("/:id", validateRequest(updateUserSchema), asyncHandler(controller.update));
        router.delete("/:id", asyncHandler(controller.delete));

        return router;
    }
}
