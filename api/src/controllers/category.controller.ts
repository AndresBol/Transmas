import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { categoryService } from "../services/category.service";
import { sendList, sendSuccess } from "../utils/http-response";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";

export class CategoryController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const result = await categoryService.list(getPagination(request.query));
        return sendList(response, result);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const category = await categoryService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: category });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const category = await categoryService.create(request.body);
        return sendSuccess(response, category, "Category created successfully", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const category = await categoryService.update(id, request.body);
        return sendSuccess(response, category, "Category updated successfully");
    };

    updateAvailability = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const category = await categoryService.updateAvailability(id, request.body.isAvailable);
        return sendSuccess(response, category, "Category availability updated successfully");
    };
}
