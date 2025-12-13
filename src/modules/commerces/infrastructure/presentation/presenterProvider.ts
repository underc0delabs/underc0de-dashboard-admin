/* eslint-disable react-hooks/rules-of-hooks */
import { useDependency } from "@/hooks/useDependency";
import { IPresenterProvider } from "@/utils/IPresenterProvider";
import { IGetCommerceAction } from "../../core/actions/getCommerceAction";
import { ICreateCommerceAction } from "../../core/actions/createCommerceAction";
import { IUpdateCommerceAction } from "../../core/actions/updateCommerceAction";
import { IDeleteCommerceAction } from "../../core/actions/deleteCommerceAction";
import { ICommerceViews } from "../../core/views/iCommerceViews";
import { ICommercePresenter } from "../../core/presentation/iCommercePresenter";
import { CommercePresenter } from "./commercePresenter";

export const commercePresenterProvider = (): IPresenterProvider<
  ICommerceViews,
  ICommercePresenter
> => {
  const getCommerceAction = useDependency(
    "getCommerceAction"
  ) as IGetCommerceAction;
  const createCommerceAction = useDependency(
    "createCommerceAction"
  ) as ICreateCommerceAction;
  const updateCommerceAction = useDependency(
    "updateCommerceAction"
  ) as IUpdateCommerceAction;
  const deleteCommerceAction = useDependency(
    "deleteCommerceAction"
  ) as IDeleteCommerceAction;

  return {
    getPresenter: (viewHandlers: ICommerceViews) => {
      const presenter = CommercePresenter(
        getCommerceAction,
        createCommerceAction,
        updateCommerceAction,
        deleteCommerceAction,
        viewHandlers
      );
      return presenter;
    },
  };
};
