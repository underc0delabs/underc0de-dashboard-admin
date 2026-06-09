import { ICategory } from "../entities/iCategory";

export interface IUpdateCategoryGateway {
  updateCategory: (id: string, category: Partial<ICategory>) => Promise<ICategory>;
}
