import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { transportationServiceSpecialtyService } from "../services/transportation-service-specialty.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class TransportationServiceSpecialtyController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const result = await transportationServiceSpecialtyService.list(getPagination(request.query));
        return sendList(response, result);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const transportationServiceId = parseId(request.params.transportationServiceId);
        const specialtyId = parseId(request.params.specialtyId);
        const relation = await transportationServiceSpecialtyService.getById(transportationServiceId, specialtyId);
        return response.status(StatusCodes.OK).json({ success: true, data: relation });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const relation = await transportationServiceSpecialtyService.create(request.body);
        return sendSuccess(response, relation, "Relationship created successfully", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const transportationServiceId = parseId(request.params.transportationServiceId);
        const specialtyId = parseId(request.params.specialtyId);
        const relation = await transportationServiceSpecialtyService.update(
            transportationServiceId,
            specialtyId,
            request.body
        );
        return sendSuccess(response, relation, "Relationship updated successfully");
    };

    delete = async (request: Request, response: Response, next: NextFunction) => {
        const transportationServiceId = parseId(request.params.transportationServiceId);
        const specialtyId = parseId(request.params.specialtyId);
        const relation = await transportationServiceSpecialtyService.delete(transportationServiceId, specialtyId);
        return sendSuccess(response, relation, "Relationship deactivated successfully");
    };
}
