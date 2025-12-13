import { DependencyManager } from "@/app.imports";
import { HttpGetNotificationGateway } from "./infrastructure/gateways/HttpGetNotificationGateway";
import { IHttpClient } from "../httpClient/interfaces";
import { HttpCreateNotificationGateway } from "./infrastructure/gateways/HttpCreateNotificationGateway";
import { HttpDeleteNotificationGateway } from "./infrastructure/gateways/HttpDeleteNotificationGateway";
import { HttpUpdateNotificationGateway } from "./infrastructure/gateways/HttpUpdateNotificationGateway";
import { getNotificationAction } from "./core/actions/getNotificationAction";
import { createNotificationAction } from "./core/actions/createNotificationAction";
import { updateNotificationAction } from "./core/actions/updateNotificationAction";
import { deleteNotificationAction } from "./core/actions/deleteNotificationAction";

export const notificationsModuleInitialize = (dependencyManager: DependencyManager) => {
  const getNotificationGateway = HttpGetNotificationGateway(dependencyManager.resolve("httpClient") as IHttpClient);
  const createNotificationGateway = HttpCreateNotificationGateway(dependencyManager.resolve("httpClient") as IHttpClient);
  const updateNotificationGateway = HttpUpdateNotificationGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );
  const deleteNotificationGateway = HttpDeleteNotificationGateway(
    dependencyManager.resolve("httpClient") as IHttpClient
  );

  const getNotificationActionResult = getNotificationAction(getNotificationGateway);
  const createNotificationActionResult = createNotificationAction(createNotificationGateway);
  const updateNotificationActionResult = updateNotificationAction(updateNotificationGateway);
  const deleteNotificationActionResult = deleteNotificationAction(deleteNotificationGateway);

  dependencyManager.register("getNotificationAction", getNotificationActionResult);
  dependencyManager.register("createNotificationAction", createNotificationActionResult);
  dependencyManager.register("updateNotificationAction", updateNotificationActionResult);
  dependencyManager.register("deleteNotificationAction", deleteNotificationActionResult);
};

