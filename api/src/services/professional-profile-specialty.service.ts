import { prisma } from "../config/prisma";
import {
    CreateProfessionalProfileSpecialtyDto,
    UpdateProfessionalProfileSpecialtyDto,
} from "../dtos/professional-profile-specialty.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { getSeededAdministrator } from "./service-helpers";

const includeJoin = {
    professionalProfile: true,
    specialty: true,
} as const;

export const professionalProfileSpecialtyService = {
    async list(pagination: PaginationOptions) {
        const where = {
            isActive: true,
            professionalProfile: { isActive: true },
            specialty: { isActive: true },
        };
        const [totalItems, data] = await Promise.all([
            prisma.professionalProfileSpecialty.count({ where }),
            prisma.professionalProfileSpecialty.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: includeJoin,
                orderBy: { createdOn: "desc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(professionalProfileId: number, specialtyId: number) {
        const relation = await prisma.professionalProfileSpecialty.findFirst({
            where: {
                professionalProfileId,
                specialtyId,
                isActive: true,
                professionalProfile: { isActive: true },
                specialty: { isActive: true },
            },
            include: includeJoin,
        });

        if (!relation) {
            throw AppError.notFound("Professional profile specialty relationship not found");
        }

        return relation;
    },

    async create(data: CreateProfessionalProfileSpecialtyDto) {
        await this.validateProfessionalProfile(data.professionalProfileId);
        await this.validateSpecialty(data.specialtyId);
        const administrator = await getSeededAdministrator();

        try {
            return await prisma.professionalProfileSpecialty.upsert({
                where: {
                    professionalProfileId_specialtyId: {
                        professionalProfileId: data.professionalProfileId,
                        specialtyId: data.specialtyId,
                    },
                },
                create: {
                    professionalProfileId: data.professionalProfileId,
                    specialtyId: data.specialtyId,
                    isActive: data.isActive ?? true,
                    createdById: administrator.id,
                    lastUpdatedById: administrator.id,
                },
                update: {
                    isActive: data.isActive ?? true,
                    lastUpdatedById: administrator.id,
                },
                include: includeJoin,
            });
        } catch (error) {
            translatePrismaError(error, "professional profile specialty relationship");
        }
    },

    async update(
        professionalProfileId: number,
        specialtyId: number,
        data: UpdateProfessionalProfileSpecialtyDto
    ) {
        await this.getById(professionalProfileId, specialtyId);
        const administrator = await getSeededAdministrator();

        try {
            return await prisma.professionalProfileSpecialty.update({
                where: {
                    professionalProfileId_specialtyId: {
                        professionalProfileId,
                        specialtyId,
                    },
                },
                data: { ...data, lastUpdatedById: administrator.id },
                include: includeJoin,
            });
        } catch (error) {
            translatePrismaError(error, "professional profile specialty relationship");
        }
    },

    async delete(professionalProfileId: number, specialtyId: number) {
        await this.getById(professionalProfileId, specialtyId);
        const administrator = await getSeededAdministrator();

        return await prisma.professionalProfileSpecialty.update({
            where: {
                professionalProfileId_specialtyId: {
                    professionalProfileId,
                    specialtyId,
                },
            },
            data: { isActive: false, lastUpdatedById: administrator.id },
            include: includeJoin,
        });
    },

    async validateProfessionalProfile(professionalProfileId: number) {
        const exists = await prisma.professionalProfile.findFirst({
            where: { id: professionalProfileId, isActive: true, isAvailable: true },
        });

        if (!exists) {
            throw AppError.badRequest("The requested professional profile does not exist");
        }
    },

    async validateSpecialty(specialtyId: number) {
        const exists = await prisma.specialty.findFirst({
            where: { id: specialtyId, isActive: true, isAvailable: true },
        });

        if (!exists) {
            throw AppError.badRequest("The requested specialty does not exist");
        }
    },
};
