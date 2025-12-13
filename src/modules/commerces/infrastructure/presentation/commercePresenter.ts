import { ICommerce } from "../../core/entities/iCommerce";
import { ICommercePresenter } from "../../core/presentation/iCommercePresenter";
import { IGetCommerceAction } from "../../core/actions/getCommerceAction";
import { ICreateCommerceAction } from "../../core/actions/createCommerceAction";
import { IUpdateCommerceAction } from "../../core/actions/updateCommerceAction";
import { IDeleteCommerceAction } from "../../core/actions/deleteCommerceAction";
import { ICommerceViews } from "../../core/views/iCommerceViews";

export const CommercePresenter = (
  getCommerceAction: IGetCommerceAction,
  createCommerceAction: ICreateCommerceAction,
  updateCommerceAction: IUpdateCommerceAction,
  deleteCommerceAction: IDeleteCommerceAction,
  viewHandlers: ICommerceViews
): ICommercePresenter => {
  return {
    getCommerces: async () => {
      getCommerceAction
        .execute()
        .then(viewHandlers.getCommercesSuccess)
        .catch(viewHandlers.getCommercesError);
    },
    createCommerce: async (commerce: Partial<ICommerce>) => {
      createCommerceAction
        .execute(commerce)
        .then(viewHandlers.createCommerceSuccess)
        .catch(viewHandlers.createCommerceError);
    },
    updateCommerce: async (id: string, commerce: Partial<ICommerce>) => {
      updateCommerceAction
        .execute(id, commerce)
        .then(viewHandlers.updateCommerceSuccess)
        .catch(viewHandlers.updateCommerceError);
    },
    deleteCommerce: async (id: string) => {
      deleteCommerceAction
        .execute(id)
        .then(viewHandlers.deleteCommerceSuccess)
        .catch(viewHandlers.deleteCommerceError);
    },
  };
};
