import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ListResult } from "./pagination";

export function sendSuccess<T>(
    res: Response,
    data: T,
    message = "Operacion realizada correctamente",
    statusCode: StatusCodes = StatusCodes.OK
) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
}

export function sendList<T>(res: Response, result: ListResult<T>) {
    if (result.meta) {
        return res.status(StatusCodes.OK).json({
            success: true,
            meta: result.meta,
            data: result.data,
        });
    }

    return res.status(StatusCodes.OK).json({
        success: true,
        data: result.data,
    });
}
