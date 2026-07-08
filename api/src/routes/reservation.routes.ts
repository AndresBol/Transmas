import { Router } from "express";
import { ReservationController } from "../controllers/reservation.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createReservationSchema, updateReservationSchema } from "../dtos/reservation.dto";

export class ReservationRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new ReservationController();

        router.get("/", asyncHandler(controller.list));
        router.get("/user/", asyncHandler(controller.listByUser));
        router.get("/:id", asyncHandler(controller.getById));
        router.post("/", validateRequest(createReservationSchema), asyncHandler(controller.create));
        router.put("/:id", validateRequest(updateReservationSchema), asyncHandler(controller.update));
        router.delete("/:id", asyncHandler(controller.delete));

        return router;
    }
}
