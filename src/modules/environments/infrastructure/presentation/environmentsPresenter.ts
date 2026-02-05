import { IEnvironmentsPresenter } from "../../core/presentation/iEnvironmentsPresenter";
import { IEnvironmentsViews } from "../../core/views/iEnvironmentsViews";
import { IGetEnvironmentAction } from "../../core/actions/getEnvironmentAction";
import { IUpdateEnvironmentAction } from "../../core/actions/updateEnvironmentAction";

export const EnvironmentsPresenter = (
  getEnvironmentAction: IGetEnvironmentAction,
  viewHandlers: IEnvironmentsViews,
  updateEnvironmentAction: IUpdateEnvironmentAction
): IEnvironmentsPresenter => {
  return {
    getEnvironment: async (key: string) => {
      getEnvironmentAction
        .execute(key)
        .then(viewHandlers.getEnvironmentSuccess)
        .catch(viewHandlers.getEnvironmentError);
    },
    updateEnvironment: async (key: string, value: string) => {
      updateEnvironmentAction
        .execute(key, value)
        .then(viewHandlers.updateEnvironmentSuccess)
        .catch(viewHandlers.updateEnvironmentError);
    },
  };
};
