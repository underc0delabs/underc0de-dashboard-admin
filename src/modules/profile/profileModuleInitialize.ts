import { DependencyManager } from "@/dependencyManager";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { HttpGetProfileGateway } from "./infrastructure/gateways/HttpGetProfileGateway";
import { HttpUpdateProfileGateway } from "./infrastructure/gateways/HttpUpdateProfileGateway";
import { GetProfileAction } from "./core/actions/getProfileAction";
import { UpdateProfileAction } from "./core/actions/updateProfileAction";

export const profileModuleInitialize = (
  dependencyManager: DependencyManager
): void => {
  const httpClient = dependencyManager.resolve("httpClient") as IHttpClient;

  const getProfileGateway = HttpGetProfileGateway(httpClient);
  const getProfileAction = GetProfileAction(getProfileGateway);
  dependencyManager.register("getProfileAction", getProfileAction);

  const updateProfileGateway = HttpUpdateProfileGateway(httpClient);
  const updateProfileAction = UpdateProfileAction(updateProfileGateway);
  dependencyManager.register("updateProfileAction", updateProfileAction);
};
