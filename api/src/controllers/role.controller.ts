import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { roleService } from "../services/role.service";

export class RoleController {
    list = async (request: Request, response: Response, next: NextFunction) => {
        const result = await roleService.list();
        return response.status(StatusCodes.OK).json({
            success: true,
            data: result,
        });
    };

    getById = async (request: Request, response: Response, next: NextFunction) => {
        const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        const id = rawId?.trim();

        if (!id) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid role ID",
            });
        }

        const role = await roleService.getById(id);

        if (!role) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Role not found",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: role,
        });
    };
}
