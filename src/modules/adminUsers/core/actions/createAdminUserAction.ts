import { IAdminUser } from "../entities/iAdminUser";
import { ICreateAdminUserGateway } from "../gateways/iCreateAdminUserGateway";

export interface ICreateAdminUserAction {
  execute(user: Partial<IAdminUser>): Promise<IAdminUser>;
}

export const CreateAdminUserAction = (
  gateway: ICreateAdminUserGateway
): ICreateAdminUserAction => {
  return {
    execute: async (user: Partial<IAdminUser>) => {
      return await gateway.createAdminUser(user);
    },
  };
};