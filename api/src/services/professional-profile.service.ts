import { Role } from "../../generated/prisma";
import { prisma } from "../config/prisma";
import {
    CreateProfessionalProfileDto,
    UpdateProfessionalProfileDto,
} from "../dtos/professional-profile.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import {
    lastUpdatedByOrCreator,
    userSafeSelect,
    validateAuditUsers,
} from "./service-helpers";

const includeProfessionalProfile = {
    professional: { select: userSafeSelect },
    district: {
        include: {
            canton: {
                include: { province: true },
            },
        },
    },
    specialties: {
        where: { isActive: true },
        include: { specialty: true },
    },
} as const;

export const professionalProfileService = {
    async list(pagination: PaginationOptions) {
        const where = { isActive: true };
        const [totalItems, data] = await Promise.all([
            prisma.professionalProfile.count({ where }),
            prisma.professionalProfile.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: includeProfessionalProfile,
                orderBy: { createdOn: "desc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const profile = await prisma.professionalProfile.findFirst({
            where: { id, isActive: true },
            include: includeProfessionalProfile,
        });

        if (!profile) {
            throw AppError.notFound("Perfil profesional no encontrado");
        }

        return profile;
    },

    async create(data: CreateProfessionalProfileDto) {
        await this.validateProfessional(data.professionalId);
        await this.validateDistrict(data.districtId);
        await this.validateSpecialties(data.specialtyIds);
        await validateAuditUsers(data);

        const lastUpdatedById = lastUpdatedByOrCreator(data);

        try {
            return await prisma.professionalProfile.create({
                data: {
                    professionalTitle: data.professionalTitle,
                    description: data.description,
                    experienceYears: data.experienceYears,
                    baseRate: data.baseRate,
                    isAvailable: data.isAvailable,
                    profilePictureUrl: data.profilePictureUrl ?? "image-not-found.jpg",
                    professionalId: data.professionalId,
                    districtId: data.districtId,
                    createdById: data.createdById,
                    lastUpdatedById,
                    specialties: data.specialtyIds?.length
                        ? {
                            create: data.specialtyIds.map((specialtyId) => ({
                                specialtyId,
                                createdById: data.createdById,
                                lastUpdatedById,
                            })),
                        }
                        : undefined,
                },
                include: includeProfessionalProfile,
            });
        } catch (error) {
            translatePrismaError(error, "perfil profesional");
        }
    },

    async update(id: number, data: UpdateProfessionalProfileDto) {
        const current = await this.getById(id);

        if (data.professionalId) {
            await this.validateProfessional(data.professionalId);
        }

        if (data.districtId) {
            await this.validateDistrict(data.districtId);
        }

        await this.validateSpecialties(data.specialtyIds);
        await validateAuditUsers(data);

        const auditUserId = data.lastUpdatedById ?? current.lastUpdatedById;

        try {
            return await prisma.professionalProfile.update({
                where: { id },
                data: {
                    professionalTitle: data.professionalTitle,
                    description: data.description,
                    experienceYears: data.experienceYears,
                    baseRate: data.baseRate,
                    isAvailable: data.isAvailable,
                    profilePictureUrl: data.profilePictureUrl,
                    professionalId: data.professionalId,
                    districtId: data.districtId,
                    lastUpdatedById: data.lastUpdatedById,
                    specialties: data.specialtyIds
                        ? {
                            deleteMany: {},
                            create: data.specialtyIds.map((specialtyId) => ({
                                specialtyId,
                                createdById: current.createdById,
                                lastUpdatedById: auditUserId,
                            })),
                        }
                        : undefined,
                },
                include: includeProfessionalProfile,
            });
        } catch (error) {
            translatePrismaError(error, "perfil profesional");
        }
    },

    async delete(id: number) {
        await this.getById(id);

        return await prisma.professionalProfile.update({
            where: { id },
            data: { isActive: false },
            include: includeProfessionalProfile,
        });
    },

    async validateProfessional(professionalId: number) {
        const professional = await prisma.user.findFirst({
            where: {
                id: professionalId,
                role: Role.PROFESSIONAL,
                isActive: true,
            },
        });

        if (!professional) {
            throw AppError.badRequest("El profesional indicado no existe o no tiene rol PROFESSIONAL");
        }
    },

    async validateDistrict(districtId: number) {
        const district = await prisma.district.findUnique({
            where: { id: districtId },
        });

        if (!district) {
            throw AppError.badRequest("El distrito indicado no existe");
        }
    },

    async validateSpecialties(specialtyIds?: number[]) {
        if (!specialtyIds?.length) {
            return;
        }

        const uniqueIds = [...new Set(specialtyIds)];

        if (uniqueIds.length !== specialtyIds.length) {
            throw AppError.badRequest("La lista de especialidades contiene valores repetidos");
        }

        const count = await prisma.specialty.count({
            where: {
                id: { in: uniqueIds },
                isActive: true,
            },
        });

        if (count !== uniqueIds.length) {
            throw AppError.badRequest("Una o mas especialidades no existen");
        }
    },
};
