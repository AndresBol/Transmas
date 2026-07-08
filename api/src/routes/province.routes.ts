import { Router } from "express";
import { ProvinceController } from "../controllers/province.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createProvinceSchema, updateProvinceSchema } from "../dtos/province.dto";

export class ProvinceRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new ProvinceController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));
        router.post("/", validateRequest(createProvinceSchema), asyncHandler(controller.create));
        router.put("/:id", validateRequest(updateProvinceSchema), asyncHandler(controller.update));
        router.delete("/:id", asyncHandler(controller.delete));

        return router;
    }
}
