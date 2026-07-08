import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { districtService } from "../services/district.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class DistrictController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const resultado = await districtService.list(getPagination(request.query));
        return sendList(response, resultado);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const district = await districtService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: district });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const district = await districtService.create(request.body);
        return sendSuccess(response, district, "Distrito creado correctamente", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const district = await districtService.update(id, request.body);
        return sendSuccess(response, district, "Distrito actualizado correctamente");
    };

    delete = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const district = await districtService.delete(id);
        return sendSuccess(response, district, "Distrito eliminado correctamente");
    };
}
