import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { serviceRatingService } from "../services/service-rating.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class ServiceRatingController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const resultado = await serviceRatingService.list(getPagination(request.query));
        return sendList(response, resultado);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const rating = await serviceRatingService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: rating });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const rating = await serviceRatingService.create(request.body);
        return sendSuccess(response, rating, "Calificacion creada correctamente", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const rating = await serviceRatingService.update(id, request.body);
        return sendSuccess(response, rating, "Calificacion actualizada correctamente");
    };

    delete = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const rating = await serviceRatingService.delete(id);
        return sendSuccess(response, rating, "Calificacion eliminada correctamente");
    };
}
