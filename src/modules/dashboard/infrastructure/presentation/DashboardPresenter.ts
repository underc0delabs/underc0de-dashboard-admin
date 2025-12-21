import { IGetUserMetricsAction } from "../../core/actions/IGetUserMetricsAction";
import { IDashboardPresenter } from "../../core/presentation/IDashboardPresenter";
import { IDashboardView } from "../../core/views/IDashboardView";

export const DashboardPresenter = (
  getUserMetricsAction: IGetUserMetricsAction,
  viewHandlers: IDashboardView
): IDashboardPresenter => {
  return {
    getMetrics: async () => {
      getUserMetricsAction.getUserMetrics().then((metrics) => {
        viewHandlers.getMetrics(metrics);
      }).catch((error) => {
        viewHandlers.getMetricsError(error);
      });
    }
  };
};