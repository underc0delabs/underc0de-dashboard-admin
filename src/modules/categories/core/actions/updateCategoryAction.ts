import { IUpdateCategoryGateway } from "../gateways/iUpdateCategoryGateway";
import { ICategory } from "../entities/iCategory";

export interface IUpdateCategoryAction {
  execute: (id: string, category: Partial<ICategory>) => Promise<ICategory>;
}

export const updateCategoryAction = (
  gateway: IUpdateCategoryGateway,
): IUpdateCategoryAction => ({
  execute: (id, category) => gateway.updateCategory(id, category),
});
