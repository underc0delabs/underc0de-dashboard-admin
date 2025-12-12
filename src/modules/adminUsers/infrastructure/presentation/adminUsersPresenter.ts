import { IGetAdminUsersAction } from "../../core/actions/getAdminUsersAction";
import { IAdminUser } from "../../core/entities/iAdminUser";
import { IAdminUsersPresenter } from "../../core/presentation/iAdminUsersPresenter";
import { IAdminUsersViews } from "../../core/views/iAdminUsersViews";
import { IEditAdminUserAction } from "../../core/actions/editAdminUserAction";
import { ICreateAdminUserAction } from "../../core/actions/createAdminUserAction";
import { IDeleteAdminUserAction } from "../../core/actions/deleteAdminUserAction";

export const AdminUsersPresenter = (
  getAdminUsersAction: IGetAdminUsersAction,
  viewHandlers: IAdminUsersViews,
  editAdminUserAction: IEditAdminUserAction,
  createAdminUserAction: ICreateAdminUserAction,
  deleteAdminUserAction: IDeleteAdminUserAction
): IAdminUsersPresenter => {
  return {
    getAdminUsers: async () => {
      getAdminUsersAction
        .execute()
        .then(viewHandlers.getUsersSuccess)
        .catch(viewHandlers.getUsersError);
    },
    updateAdminUser: async (id: string, user: IAdminUser) => {
      editAdminUserAction
        .execute(id, user)
        .then(viewHandlers.updateUserSuccess)
        .catch(viewHandlers.updateUserError);
    },
    createAdminUser: async (user: IAdminUser) => {
      createAdminUserAction
        .execute(user)
        .then(viewHandlers.createUserSuccess)
        .catch(viewHandlers.createUserError);
    },
    deleteAdminUser: async (id: string) => {
      deleteAdminUserAction
        .execute(id)
        .then(viewHandlers.deleteUserSuccess)
        .catch(viewHandlers.deleteUserError);
    },
  };
};
