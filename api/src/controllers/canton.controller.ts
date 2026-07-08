import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { cantonService } from "../services/canton.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class CantonController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const resultado = await cantonService.list(getPagination(request.query));
        return sendList(response, resultado);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const canton = await cantonService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: canton });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const canton = await cantonService.create(request.body);
        return sendSuccess(response, canton, "Canton creado correctamente", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const canton = await cantonService.update(id, request.body);
        return sendSuccess(response, canton, "Canton actualizado correctamente");
    };

    delete = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const canton = await cantonService.delete(id);
        return sendSuccess(response, canton, "Canton eliminado correctamente");
    };
}
