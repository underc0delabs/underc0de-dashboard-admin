import { DependencyManager } from "@/app.imports";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { HttpBingoGateway } from "./infrastructure/gateways/HttpBingoGateway";

export const bingoModuleInitialize = (dependencyManager: DependencyManager) => {
  const gateway = HttpBingoGateway(dependencyManager.resolve("httpClient") as IHttpClient);
  dependencyManager.register("bingoGateway", gateway);
};
