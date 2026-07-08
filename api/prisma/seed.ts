import bcrypt from "bcryptjs";
import { Role } from "../generated/prisma";
import { prisma } from "../src/config/prisma";

async function main() {
    console.log("Iniciando seed de Transmas...");

    await prisma.serviceRating.deleteMany();
    await prisma.timeline.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.transportationServiceSpecialty.deleteMany();
    await prisma.professionalProfileSpecialty.deleteMany();
    await prisma.transportationService.deleteMany();
    await prisma.professionalProfile.deleteMany();
    await prisma.specialty.deleteMany();
    await prisma.category.deleteMany();
    await prisma.status.deleteMany();
    await prisma.district.deleteMany();
    await prisma.canton.deleteMany();
    await prisma.province.deleteMany();
    await prisma.user.updateMany({
        data: {
            createdById: null,
            lastUpdatedById: null,
        },
    });
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash("123456", 10);

    const admin = await prisma.user.create({
        data: {
            firstName: "Admin",
            lastName: "Transmas",
            email: "admin@transmas.com",
            passwordHash,
            phoneNumber: "88880000",
            role: Role.ADMIN,
        },
    });

    const [client, professional] = await Promise.all([
        prisma.user.create({
            data: {
                firstName: "Ana",
                lastName: "Rodriguez",
                email: "ana@correo.com",
                passwordHash,
                phoneNumber: "88881111",
                role: Role.CLIENT,
                createdById: admin.id,
                lastUpdatedById: admin.id,
            },
        }),
        prisma.user.create({
            data: {
                firstName: "Carlos",
                lastName: "Mora",
                email: "carlos@transmas.com",
                passwordHash,
                phoneNumber: "88882222",
                role: Role.PROFESSIONAL,
                createdById: admin.id,
                lastUpdatedById: admin.id,
            },
        }),
    ]);

    await prisma.province.createMany({
        data: [
            { name: "San Jose" },
            { name: "Alajuela" },
            { name: "Heredia" },
        ],
    });

    const provinces = await prisma.province.findMany();
    const provinceMap = Object.fromEntries(provinces.map((province) => [province.name, province.id]));

    await prisma.canton.createMany({
        data: [
            { name: "San Jose", provinceId: provinceMap["San Jose"] },
            { name: "Escazu", provinceId: provinceMap["San Jose"] },
            { name: "Alajuela", provinceId: provinceMap["Alajuela"] },
            { name: "Heredia", provinceId: provinceMap["Heredia"] },
        ],
    });

    const cantons = await prisma.canton.findMany();
    const cantonMap = Object.fromEntries(cantons.map((canton) => [canton.name, canton.id]));

    await prisma.district.createMany({
        data: [
            { name: "Carmen", cantonId: cantonMap["San Jose"] },
            { name: "San Rafael", cantonId: cantonMap["Escazu"] },
            { name: "Alajuela Centro", cantonId: cantonMap["Alajuela"] },
            { name: "Heredia Centro", cantonId: cantonMap["Heredia"] },
        ],
    });

    const districts = await prisma.district.findMany();
    const districtMap = Object.fromEntries(districts.map((district) => [district.name, district.id]));

    await prisma.status.createMany({
        data: [
            { name: "Pendiente", createdById: admin.id, lastUpdatedById: admin.id },
            { name: "Cotizada", createdById: admin.id, lastUpdatedById: admin.id },
            { name: "Confirmada", createdById: admin.id, lastUpdatedById: admin.id },
            { name: "Completada", createdById: admin.id, lastUpdatedById: admin.id },
            { name: "Cancelada", createdById: admin.id, lastUpdatedById: admin.id },
        ],
    });

    await prisma.category.createMany({
        data: [
            {
                name: "Traslados",
                description: "Servicios de traslado punto a punto.",
                isAvailable: true,
                createdById: admin.id,
                lastUpdatedById: admin.id,
            },
            {
                name: "Turismo",
                description: "Servicios de transporte para tours y actividades.",
                isAvailable: true,
                createdById: admin.id,
                lastUpdatedById: admin.id,
            },
            {
                name: "Ejecutivo",
                description: "Transporte privado para viajes de negocios.",
                isAvailable: true,
                createdById: admin.id,
                lastUpdatedById: admin.id,
            },
        ],
    });

    await prisma.specialty.createMany({
        data: [
            {
                name: "Aeropuerto",
                description: "Traslados desde y hacia aeropuerto.",
                isAvailable: true,
                createdById: admin.id,
                lastUpdatedById: admin.id,
            },
            {
                name: "Turismo privado",
                description: "Atencion a rutas turisticas privadas.",
                isAvailable: true,
                createdById: admin.id,
                lastUpdatedById: admin.id,
            },
            {
                name: "Transporte ejecutivo",
                description: "Servicios para agenda empresarial.",
                isAvailable: true,
                createdById: admin.id,
                lastUpdatedById: admin.id,
            },
        ],
    });

    const [statuses, categories, specialties] = await Promise.all([
        prisma.status.findMany(),
        prisma.category.findMany(),
        prisma.specialty.findMany(),
    ]);

    const statusMap = Object.fromEntries(statuses.map((status) => [status.name, status.id]));
    const categoryMap = Object.fromEntries(categories.map((category) => [category.name, category.id]));
    const specialtyMap = Object.fromEntries(specialties.map((specialty) => [specialty.name, specialty.id]));

    const profile = await prisma.professionalProfile.create({
        data: {
            professionalTitle: "Chofer privado",
            description: "Profesional con experiencia en rutas urbanas, aeropuerto y turismo.",
            experienceYears: 8,
            baseRate: 15000,
            isAvailable: true,
            profilePictureUrl: "image-not-found.jpg",
            professionalId: professional.id,
            districtId: districtMap["Carmen"],
            createdById: admin.id,
            lastUpdatedById: admin.id,
            specialties: {
                create: [
                    {
                        specialtyId: specialtyMap["Aeropuerto"],
                        createdById: admin.id,
                        lastUpdatedById: admin.id,
                    },
                    {
                        specialtyId: specialtyMap["Turismo privado"],
                        createdById: admin.id,
                        lastUpdatedById: admin.id,
                    },
                ],
            },
        },
    });

    const airportService = await prisma.transportationService.create({
        data: {
            name: "Traslado al aeropuerto",
            description: "Servicio privado desde el GAM hacia el aeropuerto.",
            price: 22000,
            estimatedDuration: 60,
            isAvailable: true,
            professionalProfileId: profile.id,
            categoryId: categoryMap["Traslados"],
            createdById: admin.id,
            lastUpdatedById: admin.id,
            specialties: {
                create: [
                    {
                        specialtyId: specialtyMap["Aeropuerto"],
                        createdById: admin.id,
                        lastUpdatedById: admin.id,
                    },
                ],
            },
        },
    });

    await prisma.transportationService.create({
        data: {
            name: "Tour privado de ciudad",
            description: "Transporte privado para recorridos turisticos en San Jose y alrededores.",
            price: 45000,
            estimatedDuration: 180,
            isAvailable: true,
            professionalProfileId: profile.id,
            categoryId: categoryMap["Turismo"],
            createdById: admin.id,
            lastUpdatedById: admin.id,
            specialties: {
                create: [
                    {
                        specialtyId: specialtyMap["Turismo privado"],
                        createdById: admin.id,
                        lastUpdatedById: admin.id,
                    },
                ],
            },
        },
    });

    const reservation = await prisma.reservation.create({
        data: {
            description: "Traslado al aeropuerto para viaje familiar.",
            pickupLatitude: 9.932542,
            pickupLongitude: -84.079578,
            pickupAddress: "Carmen, San Jose",
            dropoffLatitude: 10.003118,
            dropoffLongitude: -84.209999,
            dropoffAddress: "Aeropuerto Internacional Juan Santamaria",
            passengerCount: 3,
            startDate: new Date("2026-07-01T08:00:00"),
            endDate: new Date("2026-07-01T09:00:00"),
            professionalResponse: "Servicio disponible para la fecha solicitada.",
            quoteAmount: 22000,
            clientId: client.id,
            transportationServiceId: airportService.id,
            pickupDistrictId: districtMap["Carmen"],
            dropoffDistrictId: districtMap["Alajuela Centro"],
            statusId: statusMap["Confirmada"],
            createdById: admin.id,
            lastUpdatedById: admin.id,
        },
    });

    await prisma.timeline.create({
        data: {
            subject: "Reservacion confirmada",
            description: "El profesional confirmo la disponibilidad del servicio.",
            reservationId: reservation.id,
            createdById: admin.id,
            lastUpdatedById: admin.id,
        },
    });

    await prisma.serviceRating.create({
        data: {
            rating: 5,
            description: "Servicio puntual y profesional.",
            reservationId: reservation.id,
            createdById: admin.id,
            lastUpdatedById: admin.id,
        },
    });

    console.log("Seed de Transmas completado con exito.");
}

main()
    .catch((error) => {
        console.error("Error en seed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
