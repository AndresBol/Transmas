import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { reservationService } from "../services/reservation.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class ReservationController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const result = await reservationService.list(getPagination(request.query));
        return sendList(response, result);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const reservation = await reservationService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: reservation });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const reservation = await reservationService.create(request.body);
        return sendSuccess(
            response,
            reservation,
            "Reservation created successfully",
            StatusCodes.CREATED,
        );
    };
}
