import { Role } from "../../generated/prisma";
import { getEnumOptions, RoleMap } from "../utils/enum-mappers";

export const roleService = {
    async list() {
        return getEnumOptions(RoleMap);
    },

    async getById(id: string) {
        const key = id.toUpperCase() as Role;
        const label = RoleMap[key];

        if (!label) {
            return null;
        }

        return {
            value: key,
            label,
        };
    },
};
