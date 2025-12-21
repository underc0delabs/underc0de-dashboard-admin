import { IAppUser } from "../entities/iAppUser";
import { IGetAppUsersGateway } from "../gateways/iGetAppUsersGateway";

export interface IGetAppUsersAction {
  execute(): Promise<IAppUser[]>;
}

export const GetAppUsersAction = (
  gateway: IGetAppUsersGateway
): IGetAppUsersAction => {
  return {
    execute: async () => {
      try {
        return await gateway.getAppUsers();
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};

