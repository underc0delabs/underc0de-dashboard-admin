import { useDependency } from "@/hooks/useDependency";
import { IPresenterProvider } from "@/utils/IPresenterProvider";
import { ICreateCategoryAction } from "../../core/actions/createCategoryAction";
import { IDeleteCategoryAction } from "../../core/actions/deleteCategoryAction";
import { IGetCategoriesAction } from "../../core/actions/getCategoriesAction";
import { IUpdateCategoryAction } from "../../core/actions/updateCategoryAction";
import { ICategoryPresenter } from "../../core/presentation/iCategoryPresenter";
import { ICategoryViews } from "../../core/views/iCategoryViews";
import { CategoryPresenter } from "./categoryPresenter";

export const categoryPresenterProvider = (): IPresenterProvider<
  ICategoryViews,
  ICategoryPresenter
> => {
  const getCategoriesAction = useDependency<IGetCategoriesAction>(
    "getCategoriesAction",
  );
  const createCategoryAction = useDependency<ICreateCategoryAction>(
    "createCategoryAction",
  );
  const updateCategoryAction = useDependency<IUpdateCategoryAction>(
    "updateCategoryAction",
  );
  const deleteCategoryAction = useDependency<IDeleteCategoryAction>(
    "deleteCategoryAction",
  );

  return {
    getPresenter(viewHandlers) {
      return CategoryPresenter(
        getCategoriesAction,
        createCategoryAction,
        updateCategoryAction,
        deleteCategoryAction,
        viewHandlers,
      );
    },
  };
};
