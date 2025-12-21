import { DependencyManager } from "@/dependencyManager";
import { HttpGetAppUserGateway } from "./infrastructure/gateways/HttpGetAppUserGateway";
import { IHttpClient } from "../httpClient/interfaces";
import { GetAppUsersAction } from "./core/actions/getAppUsersAction";
import { HttpEditAppUserGateway } from "./infrastructure/gateways/HttpEditAppUserGateway";
import { EditAppUserAction } from "./core/actions/editAppUserAction";
import { HttpCreateAppUserGateway } from "./infrastructure/gateways/HttpCreateAppUserGateway";
import { CreateAppUserAction } from "./core/actions/createAppUserAction";
import { HttpDeleteAppUserGateway } from "./infrastructure/gateways/HttpDeleteAppUserGateway";
import { DeleteAppUserAction } from "./core/actions/deleteAppUserAction";

export const appUsersModuleInitialize = (
  dependencyManager: DependencyManager
) => {
  const getAppUsersGateway = HttpGetAppUserGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );
  const getAppUsersAction = GetAppUsersAction(getAppUsersGateway);
  dependencyManager.register("getAppUsersAction", getAppUsersAction);

  const editAppUserGateway = HttpEditAppUserGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );
  const editAppUserAction = EditAppUserAction(editAppUserGateway);
  dependencyManager.register("editAppUserAction", editAppUserAction);

  const createAppUserGateway = HttpCreateAppUserGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );
  const createAppUserAction = CreateAppUserAction(createAppUserGateway);
  dependencyManager.register("createAppUserAction", createAppUserAction);

  const deleteAppUserGateway = HttpDeleteAppUserGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );
  const deleteAppUserAction = DeleteAppUserAction(deleteAppUserGateway);
  dependencyManager.register("deleteAppUserAction", deleteAppUserAction);
};

