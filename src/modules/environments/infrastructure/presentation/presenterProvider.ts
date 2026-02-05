/* eslint-disable react-hooks/rules-of-hooks */
import { IEnvironmentsPresenter } from "../../core/presentation/iEnvironmentsPresenter";
import { IPresenterProvider } from "@/utils/IPresenterProvider";
import { useDependency } from "@/hooks/useDependency";
import { IGetEnvironmentAction } from "../../core/actions/getEnvironmentAction";
import { IEnvironmentsViews } from "../../core/views/iEnvironmentsViews";
import { EnvironmentsPresenter } from "./environmentsPresenter";
import { IUpdateEnvironmentAction } from "../../core/actions/updateEnvironmentAction";

export const environmentsPresenterProvider = (): IPresenterProvider<
  IEnvironmentsViews,
  IEnvironmentsPresenter
> => {
  const getEnvironmentAction = useDependency(
    "getEnvironmentAction"
  ) as IGetEnvironmentAction;

  const updateEnvironmentAction = useDependency(
    "updateEnvironmentAction"
  ) as IUpdateEnvironmentAction;

  return {
    getPresenter(viewHandlers: IEnvironmentsViews) {
      const presenter = EnvironmentsPresenter(
        getEnvironmentAction,
        viewHandlers,
        updateEnvironmentAction
      );
      return presenter;
    },
  };
};
