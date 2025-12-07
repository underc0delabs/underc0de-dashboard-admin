/* eslint-disable react-hooks/rules-of-hooks */
import { useDependency } from "@/hooks/useDependency";
import { IPresenterProvider } from "@/utils/IPresenterProvider";
import { ILoginScreen } from "../../core/screens/ILoginScreen";
import { ILoginPresenter } from "../../core/presentation/ILoginPresenter";
import { LoginPresenter } from "./LoginPresenter";
import { ILoginAction } from "../../core/actions/ILoginAction";

export const loginPresenterProvider = (): IPresenterProvider<
  ILoginScreen,
  ILoginPresenter
> => {
  const loginAction = useDependency("loginAction") as ILoginAction;

  return {
    getPresenter(viewHandlers: ILoginScreen) {
      const presenter = LoginPresenter(
        loginAction,
        viewHandlers
      );
      return presenter;
    },
  };
};
