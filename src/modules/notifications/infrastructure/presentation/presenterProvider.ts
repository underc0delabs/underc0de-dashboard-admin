/* eslint-disable react-hooks/rules-of-hooks */
import { useDependency } from "@/hooks/useDependency";
import { IPresenterProvider } from "@/utils/IPresenterProvider";
import { IGetNotificationAction } from "../../core/actions/getNotificationAction";
import { ICreateNotificationAction } from "../../core/actions/createNotificationAction";
import { IUpdateNotificationAction } from "../../core/actions/updateNotificationAction";
import { IDeleteNotificationAction } from "../../core/actions/deleteNotificationAction";
import { INotificationViews } from "../../core/views/iNotificationViews";
import { INotificationPresenter } from "../../core/presentation/iNotificationPresenter";
import { NotificationPresenter } from "./notificationPresenter";

export const notificationPresenterProvider = (): IPresenterProvider<
  INotificationViews,
  INotificationPresenter
> => {
  const getNotificationAction = useDependency(
    "getNotificationAction"
  ) as IGetNotificationAction;
  const createNotificationAction = useDependency(
    "createNotificationAction"
  ) as ICreateNotificationAction;
  const updateNotificationAction = useDependency(
    "updateNotificationAction"
  ) as IUpdateNotificationAction;
  const deleteNotificationAction = useDependency(
    "deleteNotificationAction"
  ) as IDeleteNotificationAction;

  return {
    getPresenter: (viewHandlers: INotificationViews) => {
      const presenter = NotificationPresenter(
        getNotificationAction,
        createNotificationAction,
        updateNotificationAction,
        deleteNotificationAction,
        viewHandlers
      );
      return presenter;
    },
  };
};

