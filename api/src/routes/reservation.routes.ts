import { Router } from "express";
import { ReservationController } from "../controllers/reservation.controller";
import { createReservationSchema } from "../dtos/reservation.dto";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";

export class ReservationRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new ReservationController();

        router.get("/", asyncHandler(controller.list));
        router.get("/:id", asyncHandler(controller.getById));
        router.post(
            "/",
            validateRequest(createReservationSchema),
            asyncHandler(controller.create),
        );

        return router;
    }
}
