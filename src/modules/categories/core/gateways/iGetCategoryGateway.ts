import { ICategory } from "../entities/iCategory";

export interface IGetCategoryGateway {
  getCategories: () => Promise<ICategory[]>;
}
