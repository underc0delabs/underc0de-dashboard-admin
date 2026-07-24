import { DependencyManager } from "@/app.imports";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { HttpUserBirthdaysGateway } from "./infrastructure/gateways/HttpUserBirthdaysGateway";

export const birthdayCalendarModuleInitialize = (
  dependencyManager: DependencyManager,
) => {
  const gateway = HttpUserBirthdaysGateway(
    dependencyManager.resolve("httpClient") as IHttpClient,
  );
  dependencyManager.register("userBirthdaysGateway", gateway);
};
