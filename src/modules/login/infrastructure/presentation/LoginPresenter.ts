import { ILoginAction } from "../../core/actions/ILoginAction";
import { ILoginScreen } from "../../core/screens/ILoginScreen";

export const LoginPresenter = (
  loginAction: ILoginAction,
  viewHandlers: ILoginScreen
) => {
  return {
    login: async (email: string, password: string) => {
      loginAction
        .execute(email, password)
        .then(viewHandlers.onLoginSuccess)
        .catch(viewHandlers.onLoginError);
    },
  };
};
