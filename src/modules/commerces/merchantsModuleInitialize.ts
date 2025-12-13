import { DependencyManager } from "@/app.imports";
import { HttpGetCommerceGateway } from "./infrastructure/gateways/HttpGetCommerceGateway";
import { IHttpClient } from "../httpClient/interfaces";
import { HttpCreateCommerceGateway } from "./infrastructure/gateways/HttpCreateCommerceGateway";
import { HttpDeleteCommerceGateway } from "./infrastructure/gateways/HttpDeleteCommerceGateway";
import { HttpUpdateCommerceGateway } from "./infrastructure/gateways/HttpUpdateCommerceGateway";
import { getCommerceAction } from "./core/actions/getCommerceAction";
import { createCommerceAction } from "./core/actions/createCommerceAction";
import { updateCommerceAction } from "./core/actions/updateCommerceAction";
import { deleteCommerceAction } from "./core/actions/deleteCommerceAction";

export const merchantsModuleInitialize = (dependencyManager: DependencyManager) => {
  const getCommerceGateway = HttpGetCommerceGateway(dependencyManager.resolve("httpClient") as IHttpClient);
  const createCommerceGateway = HttpCreateCommerceGateway(dependencyManager.resolve("httpClient") as IHttpClient);
  const updateCommerceGateway = HttpUpdateCommerceGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );
  const deleteCommerceGateway = HttpDeleteCommerceGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );

  const getCommerceActionResult = getCommerceAction(getCommerceGateway);
  const createCommerceActionResult = createCommerceAction(createCommerceGateway);
  const updateCommerceActionResult = updateCommerceAction(updateCommerceGateway);
  const deleteCommerceActionResult = deleteCommerceAction(deleteCommerceGateway);

  dependencyManager.register("getCommerceAction", getCommerceActionResult);
  dependencyManager.register("createCommerceAction", createCommerceActionResult);
  dependencyManager.register("updateCommerceAction", updateCommerceActionResult);
  dependencyManager.register("deleteCommerceAction", deleteCommerceActionResult);
};