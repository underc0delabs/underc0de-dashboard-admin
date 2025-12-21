/* eslint-disable react-hooks/rules-of-hooks */
import { IAppUsersPresenter } from "../../core/presentation/iAppUsersPresenter";
import { IPresenterProvider } from "@/utils/IPresenterProvider";
import { useDependency } from "@/hooks/useDependency";
import { IGetAppUsersAction } from "../../core/actions/getAppUsersAction";
import { IAppUsersViews } from "../../core/views/iAppUsersViews";
import { AppUsersPresenter } from "./appUsersPresenter";
import { IEditAppUserAction } from "../../core/actions/editAppUserAction";
import { ICreateAppUserAction } from "../../core/actions/createAppUserAction";
import { IDeleteAppUserAction } from "../../core/actions/deleteAppUserAction";

export const appUsersPresenterProvider = (): IPresenterProvider<
  IAppUsersViews,
  IAppUsersPresenter
> => {
  const getAppUsersAction = useDependency(
    "getAppUsersAction"
  ) as IGetAppUsersAction;

  const editAppUserAction = useDependency(
    "editAppUserAction"
  ) as IEditAppUserAction;

  const createAppUserAction = useDependency(
    "createAppUserAction"
  ) as ICreateAppUserAction;

  const deleteAppUserAction = useDependency(
    "deleteAppUserAction"
  ) as IDeleteAppUserAction;

  return {
    getPresenter(viewHandlers: IAppUsersViews) {
      const presenter = AppUsersPresenter(
        getAppUsersAction,
        viewHandlers,
        editAppUserAction,
        createAppUserAction,
        deleteAppUserAction
      );
      return presenter;
    },
  };
};

