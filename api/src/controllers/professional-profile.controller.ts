import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { professionalProfileService } from "../services/professional-profile.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class ProfessionalProfileController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const resultado = await professionalProfileService.list(getPagination(request.query));
        return sendList(response, resultado);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const profile = await professionalProfileService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: profile });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const profile = await professionalProfileService.create(request.body);
        return sendSuccess(response, profile, "Perfil profesional creado correctamente", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const profile = await professionalProfileService.update(id, request.body);
        return sendSuccess(response, profile, "Perfil profesional actualizado correctamente");
    };

    delete = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const profile = await professionalProfileService.delete(id);
        return sendSuccess(response, profile, "Perfil profesional eliminado correctamente");
    };
}
