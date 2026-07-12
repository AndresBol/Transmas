import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { professionalProfileSpecialtyService } from "../services/professional-profile-specialty.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class ProfessionalProfileSpecialtyController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const result = await professionalProfileSpecialtyService.list(getPagination(request.query));
        return sendList(response, result);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const professionalProfileId = parseId(request.params.professionalProfileId);
        const specialtyId = parseId(request.params.specialtyId);
        const relation = await professionalProfileSpecialtyService.getById(professionalProfileId, specialtyId);
        return response.status(StatusCodes.OK).json({ success: true, data: relation });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const relation = await professionalProfileSpecialtyService.create(request.body);
        return sendSuccess(response, relation, "Relationship created successfully", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const professionalProfileId = parseId(request.params.professionalProfileId);
        const specialtyId = parseId(request.params.specialtyId);
        const relation = await professionalProfileSpecialtyService.update(
            professionalProfileId,
            specialtyId,
            request.body
        );
        return sendSuccess(response, relation, "Relationship updated successfully");
    };

    delete = async (request: Request, response: Response, next: NextFunction) => {
        const professionalProfileId = parseId(request.params.professionalProfileId);
        const specialtyId = parseId(request.params.specialtyId);
        const relation = await professionalProfileSpecialtyService.delete(professionalProfileId, specialtyId);
        return sendSuccess(response, relation, "Relationship deactivated successfully");
    };
}
