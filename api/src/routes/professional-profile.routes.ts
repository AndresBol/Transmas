import { Router } from "express";
import { ProfessionalProfileController } from "../controllers/professional-profile.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
    createProfessionalProfileSchema,
    updateProfessionalProfileSchema,
} from "../dtos/professional-profile.dto";

export class ProfessionalProfileRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new ProfessionalProfileController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));
        router.post("/", validateRequest(createProfessionalProfileSchema), asyncHandler(controller.create));
        router.put("/:id", validateRequest(updateProfessionalProfileSchema), asyncHandler(controller.update));
        router.delete("/:id", asyncHandler(controller.delete));

        return router;
    }
}
