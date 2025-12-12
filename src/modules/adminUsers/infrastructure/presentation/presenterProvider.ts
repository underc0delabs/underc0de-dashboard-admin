/* eslint-disable react-hooks/rules-of-hooks */
import { IAdminUsersPresenter } from "../../core/presentation/iAdminUsersPresenter";
import { IPresenterProvider } from "@/utils/IPresenterProvider";
import { useDependency } from "@/hooks/useDependency";
import { IGetAdminUsersAction } from "../../core/actions/getAdminUsersAction";
import { IAdminUsersViews } from "../../core/views/iAdminUsersViews";
import { AdminUsersPresenter } from "./adminUsersPresenter";
import { IEditAdminUserAction } from "../../core/actions/editAdminUserAction";
import { ICreateAdminUserAction } from "../../core/actions/createAdminUserAction";
import { IDeleteAdminUserGateway } from "../../core/gateways/iDeleteAdminUserGateway";
import { IDeleteAdminUserAction } from "../../core/actions/deleteAdminUserAction";

export const adminUsersPresenterProvider = (): IPresenterProvider<
  IAdminUsersViews,
  IAdminUsersPresenter
> => {
  const getAdminUsersAction = useDependency(
    "getAdminUsersAction"
  ) as IGetAdminUsersAction;

  const editAdminUserAction = useDependency(
    "editAdminUserAction"
  ) as IEditAdminUserAction;

  const createAdminUserAction = useDependency(
    "createAdminUserAction"
  ) as ICreateAdminUserAction;

  const deleteAdminUserAction = useDependency(
    "deleteAdminUserAction"
  ) as IDeleteAdminUserAction;

  return {
    getPresenter(viewHandlers: IAdminUsersViews) {
      const presenter = AdminUsersPresenter(
        getAdminUsersAction,
        viewHandlers,
        editAdminUserAction,
        createAdminUserAction,
        deleteAdminUserAction
      );
      return presenter;
    },
  };
};
