import { Router } from "express";
import { DistrictController } from "../controllers/district.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createDistrictSchema, updateDistrictSchema } from "../dtos/district.dto";

export class DistrictRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new DistrictController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));
        router.post("/", validateRequest(createDistrictSchema), asyncHandler(controller.create));
        router.put("/:id", validateRequest(updateDistrictSchema), asyncHandler(controller.update));
        router.delete("/:id", asyncHandler(controller.delete));

        return router;
    }
}
