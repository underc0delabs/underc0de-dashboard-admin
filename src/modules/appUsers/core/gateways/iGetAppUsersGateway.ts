import { IAppUser } from "../entities/iAppUser";

export interface IGetAppUsersGateway {
  getAppUsers(): Promise<IAppUser[]>;
}

