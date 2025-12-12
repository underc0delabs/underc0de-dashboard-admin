import { IAdminUser } from "../entities/iAdminUser";

export interface IEditAdminUserGateway {
  updateAdminUser(id: string, user: Partial<IAdminUser>): Promise<IAdminUser>;
}