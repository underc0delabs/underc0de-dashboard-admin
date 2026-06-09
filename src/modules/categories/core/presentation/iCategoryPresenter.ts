import { ICategory } from "../entities/iCategory";

export interface ICategoryPresenter {
  getCategories: () => void;
  createCategory: (category: Partial<ICategory>) => void;
  updateCategory: (id: string, category: Partial<ICategory>) => void;
  deleteCategory: (id: string) => void;
}
