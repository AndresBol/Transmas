import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { roleService } from "../services/role.service";

export class RoleController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const resultado = await roleService.list();
        return response.status(StatusCodes.OK).json({
            success: true,
            data: resultado,
        });
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        const id = rawId?.trim();

        if (!id) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "ID de rol invalido",
            });
        }

        const role = await roleService.getById(id);

        if (!role) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Rol no encontrado",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: role,
        });
    };
}
