import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { districtService } from "../services/district.service";
import { sendList } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class DistrictController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const result = await districtService.list(getPagination(request.query));
        return sendList(response, result);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const district = await districtService.getById(parseId(request.params.id));
        return response.status(StatusCodes.OK).json({ success: true, data: district });
    };
}
