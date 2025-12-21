/* eslint-disable react-hooks/rules-of-hooks */
import { useDependency } from "@/hooks/useDependency";
import { IDashboardPresenter } from "../../core/presentation/IDashboardPresenter";
import { IPresenterProvider } from "@/utils/IPresenterProvider";
import { IGetUserMetricsAction } from "../../core/actions/IGetUserMetricsAction";
import { IDashboardView } from "../../core/views/IDashboardView";
import { DashboardPresenter } from "./DashboardPresenter";

export const dashboardPresenterProvider = (): IPresenterProvider<
IDashboardView,
  IDashboardPresenter
> => {
  const getUserMetricsAction = useDependency("getUserMetricsAction") as IGetUserMetricsAction;
  return {
    getPresenter(viewHandlers: IDashboardView) {
      const presenter = DashboardPresenter(getUserMetricsAction, viewHandlers);
      return presenter;
    },
  };
};