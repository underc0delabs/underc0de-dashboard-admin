import { IAdminUser } from "../entities/iAdminUser";
import { IGetAdminUsersGateway } from "../gateways/iGetAdminUsersGateway";

export interface IGetAdminUsersAction {
  execute(): Promise<IAdminUser[]>;
}

export const GetAdminUsersAction = (
  gateway: IGetAdminUsersGateway
): IGetAdminUsersAction => {
  return {
    execute: async () => {
      try {
        return await gateway.getAdminUsers();
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};