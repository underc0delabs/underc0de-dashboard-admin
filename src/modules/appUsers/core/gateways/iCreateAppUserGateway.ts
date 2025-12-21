import { IAppUser } from "../entities/iAppUser";

export interface ICreateAppUserGateway {
  createAppUser(user: Partial<IAppUser>): Promise<IAppUser>;
}

