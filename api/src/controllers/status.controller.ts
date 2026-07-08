import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { statusService } from "../services/status.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class StatusController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const resultado = await statusService.list(getPagination(request.query));
        return sendList(response, resultado);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const status = await statusService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: status });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const status = await statusService.create(request.body);
        return sendSuccess(response, status, "Estado creado correctamente", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const status = await statusService.update(id, request.body);
        return sendSuccess(response, status, "Estado actualizado correctamente");
    };

    delete = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const status = await statusService.delete(id);
        return sendSuccess(response, status, "Estado eliminado correctamente");
    };
}
