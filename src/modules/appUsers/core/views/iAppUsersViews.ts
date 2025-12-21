import { IAppUser } from "../entities/iAppUser";

export interface IAppUsersViews {
  getUsersSuccess: (users: IAppUser[]) => void;
  getUsersError: (error: string) => void;
  updateUserSuccess: (user: IAppUser) => void;
  updateUserError: (error: string) => void;
  createUserSuccess: (user: IAppUser) => void;
  createUserError: (error: string) => void;
  deleteUserSuccess: (success: boolean) => void;
  deleteUserError: (error: string) => void;
}

