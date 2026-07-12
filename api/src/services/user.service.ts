import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { Role } from "../../generated/prisma";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import {
    getSeededAdministrator,
    SEEDED_ADMIN_EMAIL,
    userSafeSelect,
} from "./service-helpers";

export const userService = {
    async list(pagination: PaginationOptions) {
        const [totalItems, data] = await Promise.all([
            prisma.user.count({ where: { isActive: true } }),
            prisma.user.findMany({
                where: { isActive: true },
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
            throw AppError.notFound("User not found");
        }

        return user;
    },

    async create(data: CreateUserDto) {
        const administrator = await getSeededAdministrator();
        const passwordHash = await bcrypt.hash(data.password, 10);

        try {
            return await prisma.user.create({
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    passwordHash,
                    phoneNumber: data.phoneNumber,
                    role: Role.CLIENT,
                    createdById: administrator.id,
                    lastUpdatedById: administrator.id,
                },
                select: userSafeSelect,
            });
        } catch (error) {
            translatePrismaError(error, "user");
        }
    },

    async update(id: number, data: UpdateUserDto) {
        await this.getById(id);
        const administrator = await getSeededAdministrator();

        if (
            id === administrator.id
            && data.email
            && data.email.toLowerCase() !== SEEDED_ADMIN_EMAIL
        ) {
            throw AppError.badRequest("The seeded administrator email cannot be changed");
        }

        try {
            return await prisma.user.update({
                where: { id },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    lastUpdatedById: administrator.id,
                },
                select: userSafeSelect,
            });
        } catch (error) {
            translatePrismaError(error, "user");
        }
    },

    async updateStatus(id: number, isBlocked: boolean) {
        const current = await this.getById(id);
        const administrator = await getSeededAdministrator();

        return prisma.$transaction(async (transaction) => {
            await transaction.user.update({
                where: { id },
                data: { isBlocked, lastUpdatedById: administrator.id },
            });

            if (isBlocked && current.role === Role.PROFESSIONAL) {
                const profile = await transaction.professionalProfile.findFirst({
                    where: { professionalId: id, isActive: true },
                    select: { id: true },
                });

                if (profile) {
                    await transaction.professionalProfile.update({
                        where: { id: profile.id },
                        data: {
                            isAvailable: false,
                            lastUpdatedById: administrator.id,
                        },
                    });

                    await transaction.transportationService.updateMany({
                        where: {
                            professionalProfileId: profile.id,
                            isActive: true,
                        },
                        data: {
                            isAvailable: false,
                            lastUpdatedById: administrator.id,
                        },
                    });
                }
            }

            return transaction.user.findUniqueOrThrow({
                where: { id },
                select: userSafeSelect,
            });
        });
    },
};
