import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { timelineService } from "../services/timeline.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class TimelineController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const resultado = await timelineService.list(getPagination(request.query));
        return sendList(response, resultado);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const timeline = await timelineService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: timeline });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const timeline = await timelineService.create(request.body);
        return sendSuccess(response, timeline, "Linea de tiempo creada correctamente", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const timeline = await timelineService.update(id, request.body);
        return sendSuccess(response, timeline, "Linea de tiempo actualizada correctamente");
    };

    delete = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const timeline = await timelineService.delete(id);
        return sendSuccess(response, timeline, "Linea de tiempo eliminada correctamente");
    };
}
