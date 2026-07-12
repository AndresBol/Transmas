import { Role } from "../../generated/prisma";

export interface EnumOption {
    value: string;
    label: string;
}

export const RoleMap: Record<Role, string> = {
    [Role.CLIENT]: "Client",
    [Role.PROFESSIONAL]: "Professional",
    [Role.ADMIN]: "Administrator",
};

export function getEnumOptions<T extends string>(map: Record<T, string>): EnumOption[] {
    return Object.entries(map).map(([value, label]) => ({
        value,
        label: label as string,
    }));
}
