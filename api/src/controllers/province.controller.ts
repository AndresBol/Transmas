import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { provinceService } from "../services/province.service";
import { sendList } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class ProvinceController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const result = await provinceService.list(getPagination(request.query));
        return sendList(response, result);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const province = await provinceService.getById(parseId(request.params.id));
        return response.status(StatusCodes.OK).json({ success: true, data: province });
    };
}
