import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { userService } from "../services/user.service";
import { getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse-id";
import { sendList, sendSuccess } from "../utils/http-response";

export class UserController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const resultado = await userService.list(getPagination(request.query));
        return sendList(response, resultado);
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const user = await userService.getById(id);
        return response.status(StatusCodes.OK).json({ success: true, data: user });
    };

    create = async (request: Request, response: Response, next: NextFunction) => {
        const user = await userService.create(request.body);
        return sendSuccess(response, user, "Usuario creado correctamente", StatusCodes.CREATED);
    };

    update = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const user = await userService.update(id, request.body);
        return sendSuccess(response, user, "Usuario actualizado correctamente");
    };

    delete = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const user = await userService.delete(id);
        return sendSuccess(response, user, "Usuario eliminado correctamente");
    };
}
