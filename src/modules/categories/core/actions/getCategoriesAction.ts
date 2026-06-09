import { IGetCategoryGateway } from "../gateways/iGetCategoryGateway";
import { ICategory } from "../entities/iCategory";

export interface IGetCategoriesAction {
  execute: () => Promise<ICategory[]>;
}

export const getCategoriesAction = (
  gateway: IGetCategoryGateway,
): IGetCategoriesAction => ({
  execute: () => gateway.getCategories(),
});
