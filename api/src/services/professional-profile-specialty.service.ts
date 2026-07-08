import { prisma } from "../config/prisma";
import {
    CreateProfessionalProfileSpecialtyDto,
    UpdateProfessionalProfileSpecialtyDto,
} from "../dtos/professional-profile-specialty.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { lastUpdatedByOrCreator, validateAuditUsers } from "./service-helpers";

const includeJoin = {
    professionalProfile: true,
    specialty: true,
} as const;

export const professionalProfileSpecialtyService = {
    async list(pagination: PaginationOptions) {
        const where = { isActive: true };
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
            },
            include: includeJoin,
        });

        if (!relation) {
            throw AppError.notFound("Relacion de perfil profesional y especialidad no encontrada");
        }

        return relation;
    },

    async create(data: CreateProfessionalProfileSpecialtyDto) {
        await this.validateProfessionalProfile(data.professionalProfileId);
        await this.validateSpecialty(data.specialtyId);
        await validateAuditUsers(data);

        try {
            return await prisma.professionalProfileSpecialty.create({
                data: {
                    professionalProfileId: data.professionalProfileId,
                    specialtyId: data.specialtyId,
                    isActive: data.isActive,
                    createdById: data.createdById,
                    lastUpdatedById: lastUpdatedByOrCreator(data),
                },
                include: includeJoin,
            });
        } catch (error) {
            translatePrismaError(error, "relacion de perfil profesional y especialidad");
        }
    },

    async update(
        professionalProfileId: number,
        specialtyId: number,
        data: UpdateProfessionalProfileSpecialtyDto
    ) {
        await this.getById(professionalProfileId, specialtyId);
        await validateAuditUsers(data);

        try {
            return await prisma.professionalProfileSpecialty.update({
                where: {
                    professionalProfileId_specialtyId: {
                        professionalProfileId,
                        specialtyId,
                    },
                },
                data,
                include: includeJoin,
            });
        } catch (error) {
            translatePrismaError(error, "relacion de perfil profesional y especialidad");
        }
    },

    async delete(professionalProfileId: number, specialtyId: number) {
        await this.getById(professionalProfileId, specialtyId);

        return await prisma.professionalProfileSpecialty.update({
            where: {
                professionalProfileId_specialtyId: {
                    professionalProfileId,
                    specialtyId,
                },
            },
            data: { isActive: false },
            include: includeJoin,
        });
    },

    async validateProfessionalProfile(professionalProfileId: number) {
        const exists = await prisma.professionalProfile.findFirst({
            where: { id: professionalProfileId, isActive: true },
        });

        if (!exists) {
            throw AppError.badRequest("El perfil profesional indicado no existe");
        }
    },

    async validateSpecialty(specialtyId: number) {
        const exists = await prisma.specialty.findFirst({
            where: { id: specialtyId, isActive: true },
        });

        if (!exists) {
            throw AppError.badRequest("La especialidad indicada no existe");
        }
    },
};
