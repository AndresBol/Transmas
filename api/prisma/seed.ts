import bcrypt from "bcryptjs";
import {
  Modality,
  ProfessionalProfile,
  Role,
  TransportationService,
} from "../generated/prisma";
import { prisma } from "../src/config/prisma";

const DEFAULT_PASSWORD = "123456";

function idMap(rows: Array<{ id: number; name: string }>) {
  return Object.fromEntries(rows.map((row) => [row.name, row.id])) as Record<
    string,
    number
  >;
}

function futureDate(daysFromNow: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function clearSeedData() {
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
}

async function main() {
  console.log("Starting the Transmas seed...");
  await clearSeedData();

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const administrator = await prisma.user.create({
    data: {
      firstName: "Transmas",
      lastName: "Administrator",
      email: "admin@transmas.com",
      passwordHash,
      phoneNumber: "80000000",
      role: Role.ADMIN,
    },
  });

  await prisma.user.update({
    where: { id: administrator.id },
    data: {
      createdById: administrator.id,
      lastUpdatedById: administrator.id,
    },
  });

  const userDefinitions = [
    {
      firstName: "Emma",
      lastName: "Wilson",
      email: "emma.wilson@example.com",
      phoneNumber: "87010001",
      role: Role.CLIENT,
      isActive: true,
    },
    {
      firstName: "Noah",
      lastName: "Martinez",
      email: "noah.martinez@example.com",
      phoneNumber: "87010002",
      role: Role.CLIENT,
      isActive: true,
    },
    {
      firstName: "Diego",
      lastName: "Alvarez",
      email: "diego.alvarez@transmas.com",
      phoneNumber: "87020001",
      role: Role.PROFESSIONAL,
      isActive: true,
    },
    {
      firstName: "Sofia",
      lastName: "Ramirez",
      email: "sofia.ramirez@transmas.com",
      phoneNumber: "87020002",
      role: Role.PROFESSIONAL,
      isActive: true,
    },
    {
      firstName: "Marco",
      lastName: "Vargas",
      email: "marco.vargas@transmas.com",
      phoneNumber: "87020003",
      role: Role.PROFESSIONAL,
      isActive: true,
    },
    {
      firstName: "Elena",
      lastName: "Jimenez",
      email: "elena.jimenez@transmas.com",
      phoneNumber: "87020004",
      role: Role.PROFESSIONAL,
      isActive: true,
    },
    {
      firstName: "Luis",
      lastName: "Quesada",
      email: "luis.quesada@transmas.com",
      phoneNumber: "87020005",
      role: Role.PROFESSIONAL,
      isActive: true,
      isBlocked: true,
    },
  ];

  const seededUsers = await Promise.all(
    userDefinitions.map((user) =>
      prisma.user.create({
        data: {
          ...user,
          passwordHash,
          createdById: administrator.id,
          lastUpdatedById: administrator.id,
        },
      }),
    ),
  );

  const usersByEmail = Object.fromEntries(
    [administrator, ...seededUsers].map((user) => [user.email, user]),
  );

  await prisma.province.createMany({
    data: [
      { name: "San Jose" },
      { name: "Alajuela" },
      { name: "Cartago" },
      { name: "Heredia" },
      { name: "Guanacaste" },
      { name: "Puntarenas" },
      { name: "Limon" },
    ],
  });

  const provinceIds = idMap(await prisma.province.findMany());
  await prisma.canton.createMany({
    data: [
      { name: "San Jose", provinceId: provinceIds["San Jose"] },
      { name: "Escazu", provinceId: provinceIds["San Jose"] },
      { name: "Alajuela", provinceId: provinceIds.Alajuela },
      { name: "Cartago", provinceId: provinceIds.Cartago },
      { name: "Heredia", provinceId: provinceIds.Heredia },
      { name: "Liberia", provinceId: provinceIds.Guanacaste },
      { name: "Puntarenas", provinceId: provinceIds.Puntarenas },
      { name: "Quepos", provinceId: provinceIds.Puntarenas },
      { name: "Limon", provinceId: provinceIds.Limon },
    ],
  });

  const cantonIds = idMap(await prisma.canton.findMany());
  await prisma.district.createMany({
    data: [
      { name: "Carmen", cantonId: cantonIds["San Jose"] },
      { name: "San Rafael", cantonId: cantonIds.Escazu },
      { name: "Alajuela Central", cantonId: cantonIds.Alajuela },
      { name: "Oriental", cantonId: cantonIds.Cartago },
      { name: "Heredia Central", cantonId: cantonIds.Heredia },
      { name: "Liberia", cantonId: cantonIds.Liberia },
      { name: "Puntarenas", cantonId: cantonIds.Puntarenas },
      { name: "Quepos", cantonId: cantonIds.Quepos },
      { name: "Limon", cantonId: cantonIds.Limon },
    ],
  });

  const districtIds = idMap(await prisma.district.findMany());

  await prisma.status.createMany({
    data: ["Pending", "Confirmed", "Rejected", "Completed", "Cancelled"].map(
      (name) => ({
        name,
        createdById: administrator.id,
        lastUpdatedById: administrator.id,
      }),
    ),
  });

  const categoryDefinitions = [
    [
      "Tourist Transportation",
      "Transportation for guided tours and tourism activities.",
      true,
      true,
    ],
    [
      "Corporate Transportation",
      "Reliable transportation for companies and business teams.",
      true,
      true,
    ],
    [
      "Event Transportation",
      "Coordinated transportation for private and public events.",
      true,
      true,
    ],
    [
      "Airport Transfers",
      "Scheduled pickup and drop-off services for airports.",
      true,
      true,
    ],
    [
      "Excursions",
      "Transportation for day trips and excursions across Costa Rica.",
      true,
      true,
    ],
    [
      "Private School Transportation",
      "Private transportation for students and school groups.",
      false,
      true,
    ],
    [
      "Special Services",
      "Custom transportation for unique routes and requirements.",
      false,
      true,
    ],
  ] as const;

  await prisma.category.createMany({
    data: categoryDefinitions.map(
      ([name, description, isAvailable, isActive]) => ({
        name,
        description,
        isAvailable,
        isActive,
        createdById: administrator.id,
        lastUpdatedById: administrator.id,
      }),
    ),
  });

  const specialtyDefinitions = [
    [
      "Day Tours",
      "Same-day tourism routes and return transportation.",
      true,
      true,
    ],
    [
      "Bilingual Transportation",
      "Transportation assistance in English and Spanish.",
      true,
      true,
    ],
    [
      "4x4 Vehicles",
      "Four-wheel-drive vehicles for demanding terrain.",
      true,
      true,
    ],
    [
      "Minibus",
      "Comfortable minibus transportation for medium-sized groups.",
      true,
      true,
    ],
    ["Shuttle Bus", "Shuttle bus services for organized groups.", true, true],
    [
      "Executive Transportation",
      "Discreet executive and corporate transportation.",
      true,
      true,
    ],
    [
      "Large Groups",
      "Transportation planning for large passenger groups.",
      true,
      true,
    ],
    [
      "Mountain Routes",
      "Experienced transportation on mountain roads.",
      true,
      true,
    ],
    [
      "Night Service",
      "Transportation provided during evening and overnight hours.",
      false,
      true,
    ],
  ] as const;

  await prisma.specialty.createMany({
    data: specialtyDefinitions.map(
      ([name, description, isAvailable, isActive]) => ({
        name,
        description,
        isAvailable,
        isActive,
        createdById: administrator.id,
        lastUpdatedById: administrator.id,
      }),
    ),
  });

  const [categories, specialties] = await Promise.all([
    prisma.category.findMany(),
    prisma.specialty.findMany(),
  ]);
  const categoryIds = idMap(categories);
  const specialtyIds = idMap(specialties);

  const profileDefinitions = [
    {
      email: "diego.alvarez@transmas.com",
      professionalTitle: "Bilingual Tourism Driver",
      description:
        "Independent driver specializing in private tours and airport routes.",
      experienceYears: 10,
      modality: Modality.IN_PERSON,
      baseRate: 28000,
      isAvailable: true,
      isActive: true,
      district: "San Rafael",
      specialties: [
        "Day Tours",
        "Bilingual Transportation",
        "Executive Transportation",
      ],
    },
    {
      email: "sofia.ramirez@transmas.com",
      professionalTitle: "Corporate Transportation Specialist",
      description:
        "Professional driver for corporate teams, events, and large groups.",
      experienceYears: 8,
      modality: Modality.IN_PERSON,
      baseRate: 32000,
      isAvailable: true,
      isActive: true,
      district: "Heredia Central",
      specialties: [
        "Minibus",
        "Shuttle Bus",
        "Executive Transportation",
        "Large Groups",
      ],
    },
    {
      email: "marco.vargas@transmas.com",
      professionalTitle: "4x4 Mountain Route Guide",
      description:
        "Tour guide and driver experienced with rural and mountain destinations.",
      experienceYears: 12,
      modality: Modality.IN_PERSON,
      baseRate: 45000,
      isAvailable: true,
      isActive: true,
      district: "Liberia",
      specialties: [
        "4x4 Vehicles",
        "Day Tours",
        "Mountain Routes",
        "Night Service",
      ],
    },
    {
      email: "elena.jimenez@transmas.com",
      professionalTitle: "Remote Trip Coordinator",
      description:
        "Bilingual specialist in virtual route planning and transportation coordination.",
      experienceYears: 6,
      modality: Modality.VIRTUAL,
      baseRate: 18000,
      isAvailable: true,
      isActive: true,
      district: "Carmen",
      specialties: ["Day Tours", "Bilingual Transportation"],
    },
    {
      email: "luis.quesada@transmas.com",
      professionalTitle: "Private School Shuttle Operator",
      description:
        "Experienced operator of private school and student group transportation.",
      experienceYears: 9,
      modality: Modality.IN_PERSON,
      baseRate: 25000,
      isAvailable: false,
      isActive: true,
      district: "Oriental",
      specialties: ["Minibus", "Shuttle Bus", "Large Groups"],
    },
  ];

  const profilesByEmail: Record<string, ProfessionalProfile> = {};
  for (const definition of profileDefinitions) {
    const profile = await prisma.professionalProfile.create({
      data: {
        professionalTitle: definition.professionalTitle,
        description: definition.description,
        experienceYears: definition.experienceYears,
        modality: definition.modality,
        baseRate: definition.baseRate,
        isAvailable: definition.isAvailable,
        isActive: definition.isActive,
        profilePictureUrl: "image-not-found.svg",
        professionalId: usersByEmail[definition.email].id,
        districtId: districtIds[definition.district],
        createdById: administrator.id,
        lastUpdatedById: administrator.id,
        specialties: {
          create: definition.specialties.map((name) => ({
            specialtyId: specialtyIds[name],
            createdById: administrator.id,
            lastUpdatedById: administrator.id,
          })),
        },
      },
    });
    profilesByEmail[definition.email] = profile;
  }

  const serviceDefinitions = [
    {
      name: "Juan Santamaria Airport Transfer",
      description:
        "Private transfer between the Greater Metropolitan Area and Juan Santamaria Airport.",
      price: 28000,
      estimatedDuration: 75,
      modality: Modality.IN_PERSON,
      isAvailable: true,
      isActive: true,
      professionalEmail: "diego.alvarez@transmas.com",
      category: "Airport Transfers",
      specialties: ["Bilingual Transportation", "Executive Transportation"],
    },
    {
      name: "San Jose Day Tour Transportation",
      description:
        "Full-day private transportation around San Jose and nearby attractions.",
      price: 85000,
      estimatedDuration: 480,
      modality: Modality.IN_PERSON,
      isAvailable: true,
      isActive: true,
      professionalEmail: "diego.alvarez@transmas.com",
      category: "Tourist Transportation",
      specialties: ["Day Tours", "Bilingual Transportation"],
    },
    {
      name: "Executive Corporate Shuttle",
      description:
        "Executive transportation for business meetings and corporate teams.",
      price: 55000,
      estimatedDuration: 180,
      modality: Modality.IN_PERSON,
      isAvailable: true,
      isActive: true,
      professionalEmail: "sofia.ramirez@transmas.com",
      category: "Corporate Transportation",
      specialties: ["Minibus", "Executive Transportation"],
    },
    {
      name: "Event Group Transfer",
      description:
        "Round-trip group transportation for concerts, conferences, and celebrations.",
      price: 70000,
      estimatedDuration: 240,
      modality: Modality.IN_PERSON,
      isAvailable: true,
      isActive: true,
      professionalEmail: "sofia.ramirez@transmas.com",
      category: "Event Transportation",
      specialties: ["Shuttle Bus", "Large Groups"],
    },
    {
      name: "Guanacaste 4x4 Excursion",
      description:
        "Four-wheel-drive excursion transportation for mountain and rural destinations.",
      price: 110000,
      estimatedDuration: 540,
      modality: Modality.IN_PERSON,
      isAvailable: true,
      isActive: true,
      professionalEmail: "marco.vargas@transmas.com",
      category: "Excursions",
      specialties: ["4x4 Vehicles", "Day Tours", "Mountain Routes"],
    },
    {
      name: "Night Mountain Transfer",
      description: "Special night transportation on selected mountain routes.",
      price: 65000,
      estimatedDuration: 210,
      modality: Modality.IN_PERSON,
      isAvailable: false,
      isActive: true,
      professionalEmail: "marco.vargas@transmas.com",
      category: "Special Services",
      specialties: ["4x4 Vehicles", "Mountain Routes", "Night Service"],
    },
    {
      name: "Virtual Costa Rica Itinerary Planning",
      description:
        "Remote bilingual planning session for routes, stops, and transport requirements.",
      price: 18000,
      estimatedDuration: 60,
      modality: Modality.VIRTUAL,
      isAvailable: true,
      isActive: true,
      professionalEmail: "elena.jimenez@transmas.com",
      category: "Tourist Transportation",
      specialties: ["Day Tours", "Bilingual Transportation"],
    },
    {
      name: "Virtual Airport Transfer Coordination",
      description:
        "Remote coordination of pickup details, timing, and airport transfer requirements.",
      price: 15000,
      estimatedDuration: 45,
      modality: Modality.VIRTUAL,
      isAvailable: true,
      isActive: true,
      professionalEmail: "elena.jimenez@transmas.com",
      category: "Airport Transfers",
      specialties: ["Bilingual Transportation"],
    },
    {
      name: "Private School Route",
      description:
        "Recurring private school transportation for a supervised student group.",
      price: 40000,
      estimatedDuration: 120,
      modality: Modality.IN_PERSON,
      isAvailable: false,
      isActive: true,
      professionalEmail: "luis.quesada@transmas.com",
      category: "Private School Transportation",
      specialties: ["Minibus", "Shuttle Bus", "Large Groups"],
    },
    {
      name: "Wedding Transportation",
      description:
        "Coordinated shuttle transportation for wedding guests and family groups.",
      price: 95000,
      estimatedDuration: 360,
      modality: Modality.IN_PERSON,
      isAvailable: true,
      isActive: true,
      professionalEmail: "sofia.ramirez@transmas.com",
      category: "Event Transportation",
      specialties: ["Shuttle Bus", "Large Groups"],
    },
  ];

  const servicesByName: Record<string, TransportationService> = {};
  for (const definition of serviceDefinitions) {
    const service = await prisma.transportationService.create({
      data: {
        name: definition.name,
        description: definition.description,
        price: definition.price,
        estimatedDuration: definition.estimatedDuration,
        modality: definition.modality,
        isAvailable: definition.isAvailable,
        isActive: definition.isActive,
        professionalProfileId: profilesByEmail[definition.professionalEmail].id,
        categoryId: categoryIds[definition.category],
        createdById: administrator.id,
        lastUpdatedById: administrator.id,
        specialties: {
          create: definition.specialties.map((name) => ({
            specialtyId: specialtyIds[name],
            createdById: administrator.id,
            lastUpdatedById: administrator.id,
          })),
        },
      },
    });
    servicesByName[definition.name] = service;
  }

  const pendingStatus = await prisma.status.findUniqueOrThrow({
    where: { name: "Pending" },
  });

  const locations = {
    Carmen: {
      latitude: 9.9333,
      longitude: -84.0833,
      address: "Carmen, San Jose",
    },
    "San Rafael": {
      latitude: 9.944,
      longitude: -84.1505,
      address: "San Rafael, Escazu",
    },
    "Alajuela Central": {
      latitude: 10.0162,
      longitude: -84.2149,
      address: "Alajuela Central",
    },
    Oriental: {
      latitude: 9.8644,
      longitude: -83.9194,
      address: "Oriental, Cartago",
    },
    "Heredia Central": {
      latitude: 9.9982,
      longitude: -84.1176,
      address: "Heredia Central",
    },
    Liberia: {
      latitude: 10.6346,
      longitude: -85.4404,
      address: "Liberia, Guanacaste",
    },
    Puntarenas: {
      latitude: 9.9763,
      longitude: -84.8384,
      address: "Puntarenas Central",
    },
    Quepos: {
      latitude: 9.4319,
      longitude: -84.1619,
      address: "Quepos, Puntarenas",
    },
    Limon: { latitude: 9.9913, longitude: -83.0415, address: "Limon Central" },
  };

  const reservationDefinitions = [
    [
      "emma.wilson@example.com",
      "Juan Santamaria Airport Transfer",
      2,
      7,
      "Carmen",
      "Alajuela Central",
      3,
      "Family airport departure transfer.",
    ],
    [
      "noah.martinez@example.com",
      "San Jose Day Tour Transportation",
      3,
      8,
      "San Rafael",
      "Carmen",
      4,
      "Private day tour for visiting relatives.",
    ],
    [
      "emma.wilson@example.com",
      "Executive Corporate Shuttle",
      5,
      9,
      "Heredia Central",
      "Carmen",
      8,
      "Transportation for a corporate workshop.",
    ],
    [
      "noah.martinez@example.com",
      "Event Group Transfer",
      7,
      16,
      "Carmen",
      "Heredia Central",
      14,
      "Round-trip transportation for a conference group.",
    ],
    [
      "emma.wilson@example.com",
      "Guanacaste 4x4 Excursion",
      9,
      6,
      "Liberia",
      "Quepos",
      4,
      "Four-wheel-drive excursion with luggage.",
    ],
    [
      "noah.martinez@example.com",
      "Virtual Costa Rica Itinerary Planning",
      10,
      18,
      "Carmen",
      "Quepos",
      2,
      "Virtual planning for a multi-stop family tour.",
    ],
    [
      "emma.wilson@example.com",
      "Virtual Airport Transfer Coordination",
      12,
      11,
      "Heredia Central",
      "Alajuela Central",
      3,
      "Remote coordination for an early airport pickup.",
    ],
    [
      "noah.martinez@example.com",
      "Wedding Transportation",
      14,
      13,
      "San Rafael",
      "Carmen",
      18,
      "Wedding guest shuttle between the hotel and venue.",
    ],
    [
      "emma.wilson@example.com",
      "Juan Santamaria Airport Transfer",
      16,
      15,
      "Alajuela Central",
      "Heredia Central",
      2,
      "Airport arrival transfer with two suitcases.",
    ],
    [
      "noah.martinez@example.com",
      "Guanacaste 4x4 Excursion",
      18,
      7,
      "Liberia",
      "Puntarenas",
      5,
      "Mountain route excursion for a small group.",
    ],
    [
      "emma.wilson@example.com",
      "Virtual Costa Rica Itinerary Planning",
      20,
      17,
      "Oriental",
      "Limon",
      4,
      "Virtual coordination for a Caribbean route.",
    ],
    [
      "noah.martinez@example.com",
      "Event Group Transfer",
      22,
      19,
      "Puntarenas",
      "Quepos",
      12,
      "Evening group transfer for a private event.",
    ],
  ] as const;

  for (const [
    clientEmail,
    serviceName,
    days,
    hour,
    pickupName,
    dropoffName,
    passengers,
    description,
  ] of reservationDefinitions) {
    const service = servicesByName[serviceName];
    const pickup = locations[pickupName];
    const dropoff = locations[dropoffName];
    const startDate = futureDate(days, hour);
    const endDate = new Date(
      startDate.getTime() + service.estimatedDuration * 60_000,
    );

    await prisma.reservation.create({
      data: {
        description,
        pickupLatitude: pickup.latitude,
        pickupLongitude: pickup.longitude,
        pickupAddress: pickup.address,
        dropoffLatitude: dropoff.latitude,
        dropoffLongitude: dropoff.longitude,
        dropoffAddress: dropoff.address,
        passengerCount: passengers,
        startDate,
        endDate,
        modality: service.modality,
        professionalResponse: null,
        quoteAmount: null,
        clientId: usersByEmail[clientEmail].id,
        transportationServiceId: service.id,
        pickupDistrictId: districtIds[pickupName],
        dropoffDistrictId: districtIds[dropoffName],
        statusId: pendingStatus.id,
        createdById: administrator.id,
        lastUpdatedById: administrator.id,
      },
    });
  }

  const [
    userCount,
    profileCount,
    categoryCount,
    specialtyCount,
    serviceCount,
    reservationCount,
    pendingReservationCount,
    inPersonReservationCount,
    virtualReservationCount,
    ratingCount,
    timelineCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.professionalProfile.count(),
    prisma.category.count(),
    prisma.specialty.count(),
    prisma.transportationService.count(),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { statusId: pendingStatus.id } }),
    prisma.reservation.count({ where: { modality: Modality.IN_PERSON } }),
    prisma.reservation.count({ where: { modality: Modality.VIRTUAL } }),
    prisma.serviceRating.count(),
    prisma.timeline.count(),
  ]);

  const counts = {
    users: userCount,
    professionalProfiles: profileCount,
    categories: categoryCount,
    specialties: specialtyCount,
    transportationServices: serviceCount,
    reservations: reservationCount,
    pendingReservations: pendingReservationCount,
    inPersonReservations: inPersonReservationCount,
    virtualReservations: virtualReservationCount,
    ratings: ratingCount,
    timelines: timelineCount,
  };

  if (
    userCount !== 8 ||
    profileCount !== 5 ||
    categoryCount !== 7 ||
    specialtyCount !== 9 ||
    serviceCount !== 10 ||
    reservationCount !== 12 ||
    pendingReservationCount !== 12 ||
    inPersonReservationCount === 0 ||
    virtualReservationCount === 0 ||
    ratingCount !== 0 ||
    timelineCount !== 0
  ) {
    throw new Error(`Seed verification failed: ${JSON.stringify(counts)}`);
  }

  console.log("Transmas seed completed successfully.");
  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
