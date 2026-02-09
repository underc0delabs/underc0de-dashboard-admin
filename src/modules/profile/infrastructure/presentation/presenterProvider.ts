/* eslint-disable react-hooks/rules-of-hooks */
import { IProfilePresenter } from "../../core/presentation/iProfilePresenter";
import { IProfileViews } from "../../core/views/iProfileViews";
import { IPresenterProvider } from "@/utils/IPresenterProvider";
import { useDependency } from "@/hooks/useDependency";
import { IGetProfileAction } from "../../core/actions/getProfileAction";
import { IUpdateProfileAction } from "../../core/actions/updateProfileAction";
import { ProfilePresenter } from "./profilePresenter";

export const profilePresenterProvider = (): IPresenterProvider<
  IProfileViews,
  IProfilePresenter
> => {
  const getProfileAction = useDependency("getProfileAction") as IGetProfileAction;
  const updateProfileAction = useDependency(
    "updateProfileAction"
  ) as IUpdateProfileAction;

  return {
    getPresenter(viewHandlers: IProfileViews) {
      return ProfilePresenter(
        getProfileAction,
        updateProfileAction,
        viewHandlers
      );
    },
  };
};
