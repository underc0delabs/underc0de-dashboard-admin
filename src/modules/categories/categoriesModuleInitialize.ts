import { DependencyManager } from "@/app.imports";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { createCategoryAction } from "./core/actions/createCategoryAction";
import { deleteCategoryAction } from "./core/actions/deleteCategoryAction";
import { getCategoriesAction } from "./core/actions/getCategoriesAction";
import { updateCategoryAction } from "./core/actions/updateCategoryAction";
import { HttpCreateCategoryGateway } from "./infrastructure/gateways/HttpCreateCategoryGateway";
import { HttpDeleteCategoryGateway } from "./infrastructure/gateways/HttpDeleteCategoryGateway";
import { HttpGetCategoryGateway } from "./infrastructure/gateways/HttpGetCategoryGateway";
import { HttpUpdateCategoryGateway } from "./infrastructure/gateways/HttpUpdateCategoryGateway";

export const categoriesModuleInitialize = (
  dependencyManager: DependencyManager,
) => {
  const httpClient = dependencyManager.resolve("httpClient") as IHttpClient;

  const getGateway = HttpGetCategoryGateway(httpClient);
  const createGateway = HttpCreateCategoryGateway(httpClient);
  const updateGateway = HttpUpdateCategoryGateway(httpClient);
  const deleteGateway = HttpDeleteCategoryGateway(httpClient);

  dependencyManager.register(
    "getCategoriesAction",
    getCategoriesAction(getGateway),
  );
  dependencyManager.register(
    "createCategoryAction",
    createCategoryAction(createGateway),
  );
  dependencyManager.register(
    "updateCategoryAction",
    updateCategoryAction(updateGateway),
  );
  dependencyManager.register(
    "deleteCategoryAction",
    deleteCategoryAction(deleteGateway),
  );
};
