import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { specialtyService } from "../services/specialty.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class SpecialtyController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const result = await specialtyService.list(getPagination(request.query));
        return sendList(response, result);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const specialty = await specialtyService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: specialty });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const specialty = await specialtyService.create(request.body);
        return sendSuccess(response, specialty, "Specialty created successfully", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const specialty = await specialtyService.update(id, request.body);
        return sendSuccess(response, specialty, "Specialty updated successfully");
    };

    updateAvailability = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const specialty = await specialtyService.updateAvailability(id, request.body.isAvailable);
        return sendSuccess(response, specialty, "Specialty availability updated successfully");
    };
}
