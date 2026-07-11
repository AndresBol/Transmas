import { Router } from "express";
import { ProfessionalProfileSpecialtyController } from "../controllers/professional-profile-specialty.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
    createProfessionalProfileSpecialtySchema,
    updateProfessionalProfileSpecialtySchema,
} from "../dtos/professional-profile-specialty.dto";

export class ProfessionalProfileSpecialtyRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new ProfessionalProfileSpecialtyController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:professionalProfileId/:specialtyId", asyncHandler(controller.getById));
        router.post("/", validateRequest(createProfessionalProfileSpecialtySchema), asyncHandler(controller.create));
        router.put(
            "/:professionalProfileId/:specialtyId",
            validateRequest(updateProfessionalProfileSpecialtySchema),
            asyncHandler(controller.update)
        );
        return router;
    }
}
