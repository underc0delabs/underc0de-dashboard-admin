import { ICategory } from "../entities/iCategory";

export interface ICreateCategoryGateway {
  createCategory: (category: Partial<ICategory>) => Promise<ICategory>;
}
