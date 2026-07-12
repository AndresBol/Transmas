import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { cantonService } from "../services/canton.service";
import { sendList } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class CantonController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const result = await cantonService.list(getPagination(request.query));
        return sendList(response, result);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const canton = await cantonService.getById(parseId(request.params.id));
        return response.status(StatusCodes.OK).json({ success: true, data: canton });
    };
}
