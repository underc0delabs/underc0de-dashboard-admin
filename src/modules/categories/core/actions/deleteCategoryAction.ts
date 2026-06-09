import { IDeleteCategoryGateway } from "../gateways/iDeleteCategoryGateway";

export interface IDeleteCategoryAction {
  execute: (id: string) => Promise<void>;
}

export const deleteCategoryAction = (
  gateway: IDeleteCategoryGateway,
): IDeleteCategoryAction => ({
  execute: (id) => gateway.deleteCategory(id),
});
