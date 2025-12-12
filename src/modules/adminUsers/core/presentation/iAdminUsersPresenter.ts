import { IAdminUser } from "../entities/iAdminUser";

export interface IAdminUsersPresenter {
  getAdminUsers(): void;
  updateAdminUser(id: string, user: IAdminUser): void;
  createAdminUser(user: IAdminUser): void;
  deleteAdminUser(id: string): void;
}