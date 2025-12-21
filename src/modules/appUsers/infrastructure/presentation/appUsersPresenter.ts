import { IGetAppUsersAction } from "../../core/actions/getAppUsersAction";
import { IAppUser } from "../../core/entities/iAppUser";
import { IAppUsersPresenter } from "../../core/presentation/iAppUsersPresenter";
import { IAppUsersViews } from "../../core/views/iAppUsersViews";
import { IEditAppUserAction } from "../../core/actions/editAppUserAction";
import { ICreateAppUserAction } from "../../core/actions/createAppUserAction";
import { IDeleteAppUserAction } from "../../core/actions/deleteAppUserAction";

export const AppUsersPresenter = (
  getAppUsersAction: IGetAppUsersAction,
  viewHandlers: IAppUsersViews,
  editAppUserAction: IEditAppUserAction,
  createAppUserAction: ICreateAppUserAction,
  deleteAppUserAction: IDeleteAppUserAction
): IAppUsersPresenter => {
  return {
    getAppUsers: async () => {
      getAppUsersAction
        .execute()
        .then(viewHandlers.getUsersSuccess)
        .catch(viewHandlers.getUsersError);
    },
    updateAppUser: async (id: string, user: Partial<IAppUser>) => {
      editAppUserAction
        .execute(id, user)
        .then(viewHandlers.updateUserSuccess)
        .catch(viewHandlers.updateUserError);
    },
    createAppUser: async (user: Partial<IAppUser>) => {
      createAppUserAction
        .execute(user)
        .then(viewHandlers.createUserSuccess)
        .catch(viewHandlers.createUserError);
    },
    deleteAppUser: async (id: string) => {
      deleteAppUserAction
        .execute(id)
        .then(viewHandlers.deleteUserSuccess)
        .catch(viewHandlers.deleteUserError);
    },
  };
};

