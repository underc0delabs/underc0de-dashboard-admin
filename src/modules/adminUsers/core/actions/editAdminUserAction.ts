import { IAdminUser } from "../entities/iAdminUser";
import { IEditAdminUserGateway } from "../gateways/iEditAdminUserGateway";

export interface IEditAdminUserAction {
  execute(id: string, user: IAdminUser): Promise<IAdminUser>;
}

export const EditAdminUserAction = (
  gateway: IEditAdminUserGateway
): IEditAdminUserAction => {
  return {
    execute: async (id: string, user: Partial<IAdminUser>) => {
      return await gateway.updateAdminUser(id, user);
    },
  };
};