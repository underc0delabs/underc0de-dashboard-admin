import { DependencyManager } from "@/app.imports";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { HttpEventGateway } from "./infrastructure/gateways/HttpEventGateway";

export const eventsModuleInitialize = (
  dependencyManager: DependencyManager,
) => {
  const gateway = HttpEventGateway(
    dependencyManager.resolve("httpClient") as IHttpClient,
  );
  dependencyManager.register("eventGateway", gateway);
};
