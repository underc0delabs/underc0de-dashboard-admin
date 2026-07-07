import { DependencyManager } from "@/app.imports";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { HttpRaffleGateway } from "./infrastructure/gateways/HttpRaffleGateway";

export const rafflesModuleInitialize = (
  dependencyManager: DependencyManager,
) => {
  const gateway = HttpRaffleGateway(
    dependencyManager.resolve("httpClient") as IHttpClient,
  );
  dependencyManager.register("raffleGateway", gateway);
};
