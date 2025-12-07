import { DependencyManager } from "@/dependencyManager";
import { HttpGetUserMetricsGateway } from "./infrastructure/gateway/HttpGetUserMetricsGateway";
import { IHttpClient } from "../httpClient/interfaces";
import { GetUserMetricsAction } from "./core/actions/IGetUserMetricsAction";

export const dashboardModuleInitialize = (
  dependencyManager: DependencyManager
) => {
  const httpClient = dependencyManager.resolve("httpClient") as IHttpClient;
  const getUserMetricsGateway = HttpGetUserMetricsGateway(httpClient);
  const getUserMetricsAction = GetUserMetricsAction(getUserMetricsGateway);
  dependencyManager.register("getUserMetricsAction", getUserMetricsAction);
};
