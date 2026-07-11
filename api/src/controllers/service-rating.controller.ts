import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { serviceRatingService } from "../services/service-rating.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class ServiceRatingController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const result = await serviceRatingService.list(getPagination(request.query));
        return sendList(response, result);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const rating = await serviceRatingService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: rating });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const rating = await serviceRatingService.create(request.body);
        return sendSuccess(response, rating, "Rating created successfully", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const rating = await serviceRatingService.update(id, request.body);
        return sendSuccess(response, rating, "Rating updated successfully");
    };

    delete = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const rating = await serviceRatingService.delete(id);
        return sendSuccess(response, rating, "Rating deactivated successfully");
    };
}
