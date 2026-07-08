import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { transportationServiceService } from "../services/transportation-service.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class TransportationServiceController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const resultado = await transportationServiceService.list(getPagination(request.query));
        return sendList(response, resultado);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const service = await transportationServiceService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: service });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const service = await transportationServiceService.create(request.body);
        return sendSuccess(response, service, "Servicio de transporte creado correctamente", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const service = await transportationServiceService.update(id, request.body);
        return sendSuccess(response, service, "Servicio de transporte actualizado correctamente");
    };

    delete = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const service = await transportationServiceService.delete(id);
        return sendSuccess(response, service, "Servicio de transporte eliminado correctamente");
    };
}
