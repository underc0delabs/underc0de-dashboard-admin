import { DependencyManager } from "@/dependencyManager";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { HttpGetEnvironmentGateway } from "./infrastructure/gateways/HttpGetEnvironmentGateway";
import { GetEnvironmentAction } from "./core/actions/getEnvironmentAction";
import { HttpUpdateEnvironmentGateway } from "./infrastructure/gateways/HttpUpdateEnvironmentGateway";
import { UpdateEnvironmentAction } from "./core/actions/updateEnvironmentAction";

export const environmentsModuleInitialize = (
  dependencyManager: DependencyManager
) => {
  const getEnvironmentGateway = HttpGetEnvironmentGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );
  const getEnvironmentAction = GetEnvironmentAction(getEnvironmentGateway);
  dependencyManager.register("getEnvironmentAction", getEnvironmentAction);

  const updateEnvironmentGateway = HttpUpdateEnvironmentGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );
  const updateEnvironmentAction = UpdateEnvironmentAction(
    updateEnvironmentGateway
  );
  dependencyManager.register("updateEnvironmentAction", updateEnvironmentAction);
};
