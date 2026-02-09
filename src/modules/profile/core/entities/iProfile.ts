export enum ProfileRole {
  ADMIN = "admin",
  EDITOR = "editor",
}

export interface IProfile {
  id: string;
  email: string;
  name: string;
  role: ProfileRole;
  createdAt: string;
  updatedAt?: string;
}

export interface IProfileUpdatePayload {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}
