import { IAdminUser } from "../entities/iAdminUser";

export interface IAdminUsersViews {
  getUsersSuccess: (users: IAdminUser[]) => void;
  getUsersError: (error: string) => void;
  updateUserSuccess: (user: IAdminUser) => void;
  updateUserError: (error: string) => void;
  createUserSuccess: (user: IAdminUser) => void;
  createUserError: (error: string) => void;
  deleteUserSuccess: (success: boolean) => void;
  deleteUserError: (error: string) => void;
}
