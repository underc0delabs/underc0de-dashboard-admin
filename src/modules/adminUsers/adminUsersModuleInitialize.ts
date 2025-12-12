import { DependencyManager } from "@/dependencyManager";
import { HttpGetAdminUserGateway } from "./infrastructure/gateways/HttpGetAdminUserGateway";
import { IHttpClient } from "../httpClient/interfaces";
import { GetAdminUsersAction } from "./core/actions/getAdminUsersAction";
import { HttpEditAdminUserGateway } from "./infrastructure/gateways/HttpEditAdminUserGateway";
import { EditAdminUserAction } from "./core/actions/editAdminUserAction";
import { HttpCreateAdminUserGateway } from "./infrastructure/gateways/HttpCreateAdminUserGateway";
import { CreateAdminUserAction } from "./core/actions/createAdminUserAction";
import { HttpDeleteAdminUserGateway } from "./infrastructure/gateways/HttpDeleteAdminUserGateway";
import { DeleteAdminUserAction } from "./core/actions/deleteAdminUserAction";

export const adminUsersModuleInitialize = (
  dependencyManager: DependencyManager
) => {
  const getAdminUsersGateway = HttpGetAdminUserGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );
  const getAdminUsersAction = GetAdminUsersAction(getAdminUsersGateway);
  dependencyManager.register("getAdminUsersAction", getAdminUsersAction);

  const editAdminUserGateway = HttpEditAdminUserGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );
  const editAdminUserAction = EditAdminUserAction(editAdminUserGateway);
  dependencyManager.register("editAdminUserAction", editAdminUserAction);

  const createAdminUserGateway = HttpCreateAdminUserGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );
  const createAdminUserAction = CreateAdminUserAction(createAdminUserGateway);
  dependencyManager.register("createAdminUserAction", createAdminUserAction);

  const deleteAdminUserGateway = HttpDeleteAdminUserGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );
  const deleteAdminUserAction = DeleteAdminUserAction(deleteAdminUserGateway);
  dependencyManager.register("deleteAdminUserAction", deleteAdminUserAction);
};
