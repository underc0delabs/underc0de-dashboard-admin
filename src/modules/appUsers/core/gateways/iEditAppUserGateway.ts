import { IAppUser } from "../entities/iAppUser";

export interface IEditAppUserGateway {
  updateAppUser(id: string, user: Partial<IAppUser>): Promise<IAppUser>;
}

