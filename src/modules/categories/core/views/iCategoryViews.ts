import { ICategory } from "../entities/iCategory";

export interface ICategoryViews {
  getCategoriesSuccess: (categories: ICategory[]) => void;
  getCategoriesError: (error: Error) => void;
  createCategorySuccess: (category: ICategory) => void;
  createCategoryError: (error: Error) => void;
  updateCategorySuccess: (category: ICategory) => void;
  updateCategoryError: (error: Error) => void;
  deleteCategorySuccess: () => void;
  deleteCategoryError: (error: Error) => void;
}
