import { IAdminUser } from "../entities/iAdminUser";

export interface ICreateAdminUserGateway {
  createAdminUser(user: Partial<IAdminUser>): Promise<IAdminUser>;
}