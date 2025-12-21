import { IAppUser } from "../entities/iAppUser";
import { IEditAppUserGateway } from "../gateways/iEditAppUserGateway";

export interface IEditAppUserAction {
  execute(id: string, user: Partial<IAppUser>): Promise<IAppUser>;
}

export const EditAppUserAction = (
  gateway: IEditAppUserGateway
): IEditAppUserAction => {
  return {
    execute: async (id: string, user: Partial<IAppUser>) => {
      return await gateway.updateAppUser(id, user);
    },
  };
};

