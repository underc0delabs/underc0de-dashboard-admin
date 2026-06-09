import { ICategory } from "../../core/entities/iCategory";
import { ICreateCategoryAction } from "../../core/actions/createCategoryAction";
import { IDeleteCategoryAction } from "../../core/actions/deleteCategoryAction";
import { IGetCategoriesAction } from "../../core/actions/getCategoriesAction";
import { IUpdateCategoryAction } from "../../core/actions/updateCategoryAction";
import { ICategoryPresenter } from "../../core/presentation/iCategoryPresenter";
import { ICategoryViews } from "../../core/views/iCategoryViews";

export const CategoryPresenter = (
  getCategoriesAction: IGetCategoriesAction,
  createCategoryAction: ICreateCategoryAction,
  updateCategoryAction: IUpdateCategoryAction,
  deleteCategoryAction: IDeleteCategoryAction,
  viewHandlers: ICategoryViews,
): ICategoryPresenter => ({
  getCategories: () => {
    getCategoriesAction
      .execute()
      .then(viewHandlers.getCategoriesSuccess)
      .catch(viewHandlers.getCategoriesError);
  },
  createCategory: (category: Partial<ICategory>) => {
    createCategoryAction
      .execute(category)
      .then(viewHandlers.createCategorySuccess)
      .catch(viewHandlers.createCategoryError);
  },
  updateCategory: (id: string, category: Partial<ICategory>) => {
    updateCategoryAction
      .execute(id, category)
      .then(viewHandlers.updateCategorySuccess)
      .catch(viewHandlers.updateCategoryError);
  },
  deleteCategory: (id: string) => {
    deleteCategoryAction
      .execute(id)
      .then(viewHandlers.deleteCategorySuccess)
      .catch(viewHandlers.deleteCategoryError);
  },
});
