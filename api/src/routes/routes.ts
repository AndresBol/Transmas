import { Router } from "express";
import { UserRoutes } from "./user.routes";
import { ProfessionalProfileRoutes } from "./professional-profile.routes";
import { SpecialtyRoutes } from "./specialty.routes";
import { CategoryRoutes } from "./category.routes";
import { TransportationServiceRoutes } from "./transportation-service.routes";
import { ProfessionalProfileSpecialtyRoutes } from "./professional-profile-specialty.routes";
import { TransportationServiceSpecialtyRoutes } from "./transportation-service-specialty.routes";
import { ReservationRoutes } from "./reservation.routes";
import { ServiceRatingRoutes } from "./service-rating.routes";
import { TimelineRoutes } from "./timeline.routes";
import { StatusRoutes } from "./status.routes";
import { ProvinceRoutes } from "./province.routes";
import { CantonRoutes } from "./canton.routes";
import { DistrictRoutes } from "./district.routes";
import { RoleRoutes } from "./role.routes";
import { ImageRoutes } from "./image.routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use("/users", UserRoutes.routes);
    router.use("/roles", RoleRoutes.routes);
    router.use("/professionalProfiles", ProfessionalProfileRoutes.routes);
    router.use("/specialties", SpecialtyRoutes.routes);
    router.use("/categories", CategoryRoutes.routes);
    router.use("/transportationServices", TransportationServiceRoutes.routes);
    router.use(
      "/professionalProfileSpecialties",
      ProfessionalProfileSpecialtyRoutes.routes,
    );
    router.use(
      "/transportationServiceSpecialties",
      TransportationServiceSpecialtyRoutes.routes,
    );
    router.use("/reservations", ReservationRoutes.routes);
    router.use("/serviceRatings", ServiceRatingRoutes.routes);
    router.use("/timeline", TimelineRoutes.routes);
    router.use("/status", StatusRoutes.routes);
    router.use("/provinces", ProvinceRoutes.routes);
    router.use("/cantons", CantonRoutes.routes);
    router.use("/districts", DistrictRoutes.routes);
    router.use("/images", ImageRoutes.routes);

    return router;
  }
}
