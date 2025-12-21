import { IAppUser } from "../entities/iAppUser";

export interface IAppUsersPresenter {
  getAppUsers(): void;
  updateAppUser(id: string, user: Partial<IAppUser>): void;
  createAppUser(user: Partial<IAppUser>): void;
  deleteAppUser(id: string): void;
}

