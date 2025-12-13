export enum AdminUserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
}

export interface IAdminUser {
  id?: string;
  email: string;
  name: string;
  role: AdminUserRole;
  status?: boolean;
  createdAt: string;
  updatedAt?: string;
  password?: string;
}