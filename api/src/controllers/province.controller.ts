import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { provinceService } from "../services/province.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class ProvinceController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const resultado = await provinceService.list(getPagination(request.query));
        return sendList(response, resultado);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const province = await provinceService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: province });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const province = await provinceService.create(request.body);
        return sendSuccess(response, province, "Provincia creada correctamente", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const province = await provinceService.update(id, request.body);
        return sendSuccess(response, province, "Provincia actualizada correctamente");
    };

    delete = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const province = await provinceService.delete(id);
        return sendSuccess(response, province, "Provincia eliminada correctamente");
    };
}
