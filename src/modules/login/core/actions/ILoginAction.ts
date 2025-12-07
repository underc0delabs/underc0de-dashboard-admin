import { ILoginGateway } from "../gateways/ILoginGateway";

export interface ILoginAction {
  execute: (email: string, password: string) => Promise<any>;
}

export const LoginAction = (loginGateway: ILoginGateway): ILoginAction => {
  return {
    async execute(email, password) {
      try {
        return await loginGateway.login(email, password);
      } catch (err) {
        return Promise.reject(err);
      }
    },
  };
};
