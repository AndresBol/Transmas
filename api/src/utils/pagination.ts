import { Request } from "express";

export interface PaginationOptions {
    page: number;
    limit: number;
    paginate: boolean;
    skip?: number;
    take?: number;
}

export interface PaginationMeta {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}

export interface ListResult<T> {
    data: T[];
    meta?: PaginationMeta;
}

export function getPagination(query: Request["query"]): PaginationOptions {
    const page = parseInt(query.page as string, 10) || 1;
    const limit = parseInt(query.limit as string, 10) || 0;
    const paginate = limit > 0;

    return {
        page,
        limit,
        paginate,
        skip: paginate ? (page - 1) * limit : undefined,
        take: paginate ? limit : undefined,
    };
}

export function buildListResult<T>(
    totalItems: number,
    data: T[],
    options: PaginationOptions
): ListResult<T> {
    if (!options.paginate) {
        return { data };
    }

    return {
        meta: {
            totalItems,
            totalPages: Math.ceil(totalItems / options.limit),
            currentPage: options.page,
            limit: options.limit,
        },
        data,
    };
}
