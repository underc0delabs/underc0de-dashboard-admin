import { IAppUser } from "../entities/iAppUser";
import { ICreateAppUserGateway } from "../gateways/iCreateAppUserGateway";

export interface ICreateAppUserAction {
  execute(user: Partial<IAppUser>): Promise<IAppUser>;
}

export const CreateAppUserAction = (
  gateway: ICreateAppUserGateway
): ICreateAppUserAction => {
  return {
    execute: async (user: Partial<IAppUser>) => {
      return await gateway.createAppUser(user);
    },
  };
};

