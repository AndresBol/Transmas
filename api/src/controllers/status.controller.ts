import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { statusService } from "../services/status.service";
import { sendList } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class StatusController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const result = await statusService.list(getPagination(request.query));
        return sendList(response, result);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const status = await statusService.getById(parseId(request.params.id));
        return response.status(StatusCodes.OK).json({ success: true, data: status });
    };
}
