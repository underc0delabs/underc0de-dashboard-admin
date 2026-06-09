import { ICreateCategoryGateway } from "../gateways/iCreateCategoryGateway";
import { ICategory } from "../entities/iCategory";

export interface ICreateCategoryAction {
  execute: (category: Partial<ICategory>) => Promise<ICategory>;
}

export const createCategoryAction = (
  gateway: ICreateCategoryGateway,
): ICreateCategoryAction => ({
  execute: (category) => gateway.createCategory(category),
});
