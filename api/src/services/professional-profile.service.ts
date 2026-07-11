import bcrypt from "bcryptjs";
import { Prisma, Role } from "../../generated/prisma";
import { prisma } from "../config/prisma";
import {
    CreateProfessionalProfileDto,
    UpdateProfessionalProfileDto,
} from "../dtos/professional-profile.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { ImageService } from "./image.service";
import { getSeededAdministrator, userSafeSelect } from "./service-helpers";

const imageService = new ImageService();

const activeProfessionalProfileWhere = {
    isActive: true,
    professional: { isActive: true },
} satisfies Prisma.ProfessionalProfileWhereInput;

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
        where: {
            isActive: true,
            specialty: { isActive: true },
        },
        include: { specialty: true },
    },
    services: {
        where: {
            isActive: true,
            category: { isActive: true },
        },
        include: {
            category: true,
            specialties: {
                where: {
                    isActive: true,
                    specialty: { isActive: true },
                },
                include: { specialty: true },
            },
        },
        orderBy: { name: "asc" },
    },
} as const;

async function syncSpecialties(
    transaction: Prisma.TransactionClient,
    professionalProfileId: number,
    specialtyIds: number[],
    administratorId: number,
) {
    await transaction.professionalProfileSpecialty.updateMany({
        where: {
            professionalProfileId,
            isActive: true,
            ...(specialtyIds.length ? { specialtyId: { notIn: specialtyIds } } : {}),
        },
        data: {
            isActive: false,
            lastUpdatedById: administratorId,
        },
    });

    await Promise.all(
        specialtyIds.map((specialtyId) =>
            transaction.professionalProfileSpecialty.upsert({
                where: {
                    professionalProfileId_specialtyId: {
                        professionalProfileId,
                        specialtyId,
                    },
                },
                create: {
                    professionalProfileId,
                    specialtyId,
                    isActive: true,
                    createdById: administratorId,
                    lastUpdatedById: administratorId,
                },
                update: {
                    isActive: true,
                    lastUpdatedById: administratorId,
                },
            }),
        ),
    );
}

async function deleteUnreferencedProfileImage(fileName?: string) {
    if (!fileName) {
        return;
    }

    try {
        const referenceCount = await prisma.professionalProfile.count({
            where: { profilePictureUrl: fileName },
        });

        if (referenceCount === 0) {
            await imageService.deleteImageIfExists(fileName);
        }
    } catch {
        // Image cleanup must never hide the result of the profile database operation.
    }
}

export const professionalProfileService = {
    async list(pagination: PaginationOptions) {
        const [totalItems, data] = await Promise.all([
            prisma.professionalProfile.count({ where: activeProfessionalProfileWhere }),
            prisma.professionalProfile.findMany({
                where: activeProfessionalProfileWhere,
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
            where: { id, ...activeProfessionalProfileWhere },
            include: includeProfessionalProfile,
        });

        if (!profile) {
            throw AppError.notFound("Professional profile not found");
        }

        return profile;
    },

    async create(data: CreateProfessionalProfileDto) {
        try {
            const administrator = await getSeededAdministrator();
            await Promise.all([
                this.validateDistrict(data.districtId),
                this.validateSpecialties(data.specialtyIds),
            ]);

            const passwordHash = await bcrypt.hash(data.password, 10);

            return await prisma.$transaction(async (transaction) => {
                const professional = await transaction.user.create({
                    data: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        passwordHash,
                        phoneNumber: data.phoneNumber,
                        role: Role.PROFESSIONAL,
                        createdById: administrator.id,
                        lastUpdatedById: administrator.id,
                    },
                });

                const profile = await transaction.professionalProfile.create({
                    data: {
                        professionalTitle: data.professionalTitle,
                        description: data.description,
                        experienceYears: data.experienceYears,
                        modality: data.modality,
                        baseRate: data.baseRate,
                        isAvailable: data.isAvailable,
                        profilePictureUrl: data.profilePictureUrl ?? "image-not-found.svg",
                        professionalId: professional.id,
                        districtId: data.districtId,
                        createdById: administrator.id,
                        lastUpdatedById: administrator.id,
                    },
                });

                await syncSpecialties(
                    transaction,
                    profile.id,
                    data.specialtyIds,
                    administrator.id,
                );

                return transaction.professionalProfile.findUniqueOrThrow({
                    where: { id: profile.id },
                    include: includeProfessionalProfile,
                });
            });
        } catch (error) {
            await deleteUnreferencedProfileImage(data.profilePictureUrl);
            translatePrismaError(error, "professional profile");
        }
    },

    async update(id: number, data: UpdateProfessionalProfileDto) {
        let previousImageFileName: string | undefined;

        try {
            const current = await this.getById(id);
            previousImageFileName = current.profilePictureUrl;
            const administrator = await getSeededAdministrator();
            const retainedSpecialtyIds = current.specialties.map(
                (specialty) => specialty.specialtyId,
            );

            await Promise.all([
                data.districtId ? this.validateDistrict(data.districtId) : Promise.resolve(),
                data.specialtyIds
                    ? this.validateSpecialties(data.specialtyIds, retainedSpecialtyIds)
                    : Promise.resolve(),
            ]);

            if (
                data.isAvailable === true
                && (
                    !current.professional.isActive
                    || current.professional.isBlocked
                )
            ) {
                throw AppError.badRequest(
                    "A professional profile cannot be available while its user is deleted or blocked",
                );
            }

            const updatedProfile = await prisma.$transaction(async (transaction) => {
                await transaction.user.update({
                    where: { id: current.professionalId },
                    data: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        phoneNumber: data.phoneNumber,
                        role: Role.PROFESSIONAL,
                        lastUpdatedById: administrator.id,
                    },
                });

                await transaction.professionalProfile.update({
                    where: { id },
                    data: {
                        professionalTitle: data.professionalTitle,
                        description: data.description,
                        experienceYears: data.experienceYears,
                        modality: data.modality,
                        baseRate: data.baseRate,
                        isAvailable: data.isAvailable,
                        profilePictureUrl: data.profilePictureUrl,
                        districtId: data.districtId,
                        lastUpdatedById: administrator.id,
                    },
                });

                if (data.specialtyIds) {
                    await syncSpecialties(
                        transaction,
                        id,
                        data.specialtyIds,
                        administrator.id,
                    );
                }

                if (data.modality && data.modality !== current.modality) {
                    await transaction.transportationService.updateMany({
                        where: {
                            professionalProfileId: id,
                            isActive: true,
                        },
                        data: {
                            modality: data.modality,
                            lastUpdatedById: administrator.id,
                        },
                    });
                }

                if (data.isAvailable === false) {
                    await transaction.transportationService.updateMany({
                        where: {
                            professionalProfileId: id,
                            isActive: true,
                        },
                        data: {
                            isAvailable: false,
                            lastUpdatedById: administrator.id,
                        },
                    });
                }

                return transaction.professionalProfile.findUniqueOrThrow({
                    where: { id },
                    include: includeProfessionalProfile,
                });
            });

            if (
                data.profilePictureUrl &&
                data.profilePictureUrl !== previousImageFileName
            ) {
                await deleteUnreferencedProfileImage(previousImageFileName);
            }

            return updatedProfile;
        } catch (error) {
            if (
                data.profilePictureUrl &&
                data.profilePictureUrl !== previousImageFileName
            ) {
                await deleteUnreferencedProfileImage(data.profilePictureUrl);
            }
            translatePrismaError(error, "professional profile");
        }
    },

    async updateAvailability(id: number, isAvailable: boolean) {
        const current = await this.getById(id);
        const administrator = await getSeededAdministrator();

        if (
            isAvailable
            && (
                !current.professional.isActive
                || current.professional.isBlocked
            )
        ) {
            throw AppError.badRequest(
                "A professional profile cannot be available while its user is deleted or blocked",
            );
        }

        return prisma.$transaction(async (transaction) => {
            await transaction.professionalProfile.update({
                where: { id },
                data: {
                    isAvailable,
                    lastUpdatedById: administrator.id,
                },
            });

            if (!isAvailable) {
                await transaction.transportationService.updateMany({
                    where: {
                        professionalProfileId: id,
                        isActive: true,
                    },
                    data: {
                        isAvailable: false,
                        lastUpdatedById: administrator.id,
                    },
                });
            }

            return transaction.professionalProfile.findUniqueOrThrow({
                where: { id },
                include: includeProfessionalProfile,
            });
        });
    },

    async validateDistrict(districtId: number) {
        const district = await prisma.district.findUnique({
            where: { id: districtId },
        });

        if (!district) {
            throw AppError.badRequest("The requested district does not exist");
        }
    },

    async validateSpecialties(
        specialtyIds: number[],
        retainedSpecialtyIds: number[] = [],
    ) {
        if (!specialtyIds.length) {
            return;
        }

        const specialties = await prisma.specialty.findMany({
            where: { id: { in: specialtyIds } },
            select: {
                id: true,
                isActive: true,
                isAvailable: true,
            },
        });
        const retainedIds = new Set(retainedSpecialtyIds);
        const hasInvalidSpecialty = specialties.some((specialty) => (
            !specialty.isActive
            || (!specialty.isAvailable && !retainedIds.has(specialty.id))
        ));

        if (specialties.length !== specialtyIds.length || hasInvalidSpecialty) {
            throw AppError.badRequest(
                "Every new specialty must exist, not be deleted, and be available",
            );
        }
    },
};
