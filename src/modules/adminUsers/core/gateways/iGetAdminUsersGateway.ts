import { IAdminUser } from "../entities/iAdminUser";

export interface IGetAdminUsersGateway {
  getAdminUsers(): Promise<IAdminUser[]>;
}