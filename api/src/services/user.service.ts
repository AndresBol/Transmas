import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { userSafeSelect, validateOptionalUser } from "./service-helpers";

export const userService = {
    async list(pagination: PaginationOptions) {
        const where = { isActive: true };
        const [totalItems, data] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                select: userSafeSelect,
                orderBy: { createdOn: "desc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const user = await prisma.user.findFirst({
            where: { id, isActive: true },
            select: userSafeSelect,
        });

        if (!user) {
            throw AppError.notFound("Usuario no encontrado");
        }

        return user;
    },

    async create(data: CreateUserDto) {
        await validateOptionalUser(data.createdById);
        await validateOptionalUser(data.lastUpdatedById);

        const passwordHash = await bcrypt.hash(data.password, 10);

        try {
            return await prisma.user.create({
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    passwordHash,
                    phoneNumber: data.phoneNumber,
                    role: data.role,
                    isBlocked: data.isBlocked,
                    isActive: data.isActive,
                    createdById: data.createdById,
                    lastUpdatedById: data.lastUpdatedById ?? data.createdById,
                },
                select: userSafeSelect,
            });
        } catch (error) {
            translatePrismaError(error, "usuario");
        }
    },

    async update(id: number, data: UpdateUserDto) {
        await this.getById(id);
        await validateOptionalUser(data.lastUpdatedById);

        const passwordHash = data.password
            ? await bcrypt.hash(data.password, 10)
            : undefined;

        try {
            return await prisma.user.update({
                where: { id },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    passwordHash,
                    phoneNumber: data.phoneNumber,
                    role: data.role,
                    isBlocked: data.isBlocked,
                    isActive: data.isActive,
                    lastUpdatedById: data.lastUpdatedById,
                },
                select: userSafeSelect,
            });
        } catch (error) {
            translatePrismaError(error, "usuario");
        }
    },

    async delete(id: number) {
        await this.getById(id);

        return await prisma.user.update({
            where: { id },
            data: { isActive: false },
            select: userSafeSelect,
        });
    },
};
