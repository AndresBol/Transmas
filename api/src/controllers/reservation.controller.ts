import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Role } from "../../generated/prisma";
import { reservationService } from "../services/reservation.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class ReservationController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const resultado = await reservationService.list(getPagination(request.query));
        return sendList(response, resultado);
    };

    listByUser = async (request: Request, response: Response, next: NextFunction) => {
        const queryId = parseInt(request.query.usuarioId as string, 10);
        const clientId = !Number.isNaN(queryId) ? queryId : 2;
        const rawRole = ((request.query.role as string) || Role.CLIENT).toUpperCase() as Role;
        const role = Object.values(Role).includes(rawRole) ? rawRole : Role.CLIENT;
        const resultado = await reservationService.listByUser(
            clientId,
            role,
            getPagination(request.query)
        );

        return sendList(response, resultado);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const reservation = await reservationService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: reservation });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const reservation = await reservationService.create(request.body);
        return sendSuccess(response, reservation, "Reservacion creada correctamente", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const reservation = await reservationService.update(id, request.body);
        return sendSuccess(response, reservation, "Reservacion actualizada correctamente");
    };

    delete = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const reservation = await reservationService.delete(id);
        return sendSuccess(response, reservation, "Reservacion eliminada correctamente");
    };
}
