export type UserRole = 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  isBlocked?: boolean;
  isActive: boolean;
  createdOn?: string;
  lastUpdatedOn?: string;
}

export interface UserStatusDto {
  isBlocked: boolean;
}
