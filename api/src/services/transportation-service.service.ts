import { Modality, Prisma } from "../../generated/prisma";
import { prisma } from "../config/prisma";
import {
    CreateTransportationServiceDto,
    UpdateTransportationServiceDto,
} from "../dtos/transportation-service.dto";
import { AppError } from "../utils/app-error";
import { buildListResult, PaginationOptions } from "../utils/pagination";
import { translatePrismaError } from "../utils/prisma-error";
import { getSeededAdministrator, userSafeSelect } from "./service-helpers";

const activeTransportationServiceWhere = {
    isActive: true,
    category: { isActive: true },
    professionalProfile: {
        isActive: true,
        professional: { isActive: true },
    },
} satisfies Prisma.TransportationServiceWhereInput;

const includeTransportationService = {
    professionalProfile: {
        include: {
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
        },
    },
    category: true,
    specialties: {
        where: {
            isActive: true,
            specialty: { isActive: true },
        },
        include: { specialty: true },
    },
} as const;

async function syncSpecialties(
    transaction: Prisma.TransactionClient,
    transportationServiceId: number,
    specialtyIds: number[],
    administratorId: number,
) {
    await transaction.transportationServiceSpecialty.updateMany({
        where: {
            transportationServiceId,
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
            transaction.transportationServiceSpecialty.upsert({
                where: {
                    transportationServiceId_specialtyId: {
                        transportationServiceId,
                        specialtyId,
                    },
                },
                create: {
                    transportationServiceId,
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

export const transportationServiceService = {
    async list(pagination: PaginationOptions) {
        const [totalItems, data] = await Promise.all([
            prisma.transportationService.count({ where: activeTransportationServiceWhere }),
            prisma.transportationService.findMany({
                where: activeTransportationServiceWhere,
                skip: pagination.skip,
                take: pagination.take,
                include: includeTransportationService,
                orderBy: { createdOn: "desc" },
            }),
        ]);

        return buildListResult(totalItems, data, pagination);
    },

    async getById(id: number) {
        const service = await prisma.transportationService.findFirst({
            where: { id, ...activeTransportationServiceWhere },
            include: includeTransportationService,
        });

        if (!service) {
            throw AppError.notFound("Transportation service not found");
        }

        return service;
    },

    async create(data: CreateTransportationServiceDto) {
        const administrator = await getSeededAdministrator();
        await Promise.all([
            this.validateProfessionalProfile(data.professionalProfileId, data.modality),
            this.validateCategory(data.categoryId),
            this.validateSpecialties(data.specialtyIds),
        ]);

        try {
            return await prisma.$transaction(async (transaction) => {
                const service = await transaction.transportationService.create({
                    data: {
                        name: data.name,
                        description: data.description,
                        price: data.price,
                        estimatedDuration: data.estimatedDuration,
                        modality: data.modality,
                        isAvailable: data.isAvailable,
                        professionalProfileId: data.professionalProfileId,
                        categoryId: data.categoryId,
                        createdById: administrator.id,
                        lastUpdatedById: administrator.id,
                    },
                });

                await syncSpecialties(
                    transaction,
                    service.id,
                    data.specialtyIds,
                    administrator.id,
                );

                return transaction.transportationService.findUniqueOrThrow({
                    where: { id: service.id },
                    include: includeTransportationService,
                });
            });
        } catch (error) {
            translatePrismaError(error, "transportation service");
        }
    },

    async update(id: number, data: UpdateTransportationServiceDto) {
        const current = await this.getById(id);
        const administrator = await getSeededAdministrator();
        const professionalProfileId = data.professionalProfileId ?? current.professionalProfileId;
        const modality = data.modality ?? current.modality;
        const categoryId = data.categoryId ?? current.categoryId;
        const specialtyIds = data.specialtyIds
            ?? current.specialties.map((specialty) => specialty.specialtyId);
        const retainedSpecialtyIds = current.specialties.map(
            (specialty) => specialty.specialtyId,
        );
        const isReactivating = !current.isAvailable && data.isAvailable === true;

        await Promise.all([
            this.validateProfessionalProfile(
                professionalProfileId,
                modality,
                isReactivating
                    || professionalProfileId !== current.professionalProfileId,
            ),
            this.validateCategory(
                categoryId,
                isReactivating || categoryId !== current.categoryId,
            ),
            this.validateSpecialties(
                specialtyIds,
                retainedSpecialtyIds,
                isReactivating,
            ),
        ]);

        try {
            return await prisma.$transaction(async (transaction) => {
                await transaction.transportationService.update({
                    where: { id },
                    data: {
                        name: data.name,
                        description: data.description,
                        price: data.price,
                        estimatedDuration: data.estimatedDuration,
                        modality: data.modality,
                        isAvailable: data.isAvailable,
                        professionalProfileId: data.professionalProfileId,
                        categoryId: data.categoryId,
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

                return transaction.transportationService.findUniqueOrThrow({
                    where: { id },
                    include: includeTransportationService,
                });
            });
        } catch (error) {
            translatePrismaError(error, "transportation service");
        }
    },

    async updateAvailability(id: number, isAvailable: boolean) {
        const current = await this.getById(id);
        const administrator = await getSeededAdministrator();

        if (isAvailable && !current.isAvailable) {
            await Promise.all([
                this.validateProfessionalProfile(
                    current.professionalProfileId,
                    current.modality,
                    true,
                ),
                this.validateCategory(current.categoryId, true),
                this.validateSpecialties(
                    current.specialties.map((specialty) => specialty.specialtyId),
                    [],
                    true,
                ),
            ]);
        }

        return prisma.transportationService.update({
            where: { id },
            data: {
                isAvailable,
                lastUpdatedById: administrator.id,
            },
            include: includeTransportationService,
        });
    },

    async validateProfessionalProfile(
        professionalProfileId: number,
        modality: Modality,
        requireAvailable = true,
    ) {
        const profile = await prisma.professionalProfile.findUnique({
            where: { id: professionalProfileId },
            include: { professional: true },
        });

        if (
            !profile
            || !profile.isActive
            || !profile.professional.isActive
            || (requireAvailable && (
                !profile.isAvailable
                || profile.professional.isBlocked
            ))
        ) {
            throw AppError.badRequest(
                requireAvailable
                    ? "The selected professional profile must exist and be available"
                    : "The selected professional profile must exist and not be deleted",
            );
        }

        if (profile.modality !== modality) {
            throw AppError.badRequest(
                "The service modality must match the professional profile modality",
            );
        }
    },

    async validateCategory(categoryId: number, requireAvailable = true) {
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (
            !category
            || !category.isActive
            || (requireAvailable && !category.isAvailable)
        ) {
            throw AppError.badRequest(
                requireAvailable
                    ? "The selected category must exist and be available"
                    : "The selected category must exist and not be deleted",
            );
        }
    },

    async validateSpecialties(
        specialtyIds: number[],
        retainedSpecialtyIds: number[] = [],
        requireAvailable = true,
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
            || (!specialty.isAvailable && (
                requireAvailable || !retainedIds.has(specialty.id)
            ))
        ));

        if (specialties.length !== specialtyIds.length || hasInvalidSpecialty) {
            throw AppError.badRequest(
                "Every new specialty must exist, not be deleted, and be available",
            );
        }
    },
};
