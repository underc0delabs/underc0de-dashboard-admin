import { IDeleteAdminUserGateway } from "../gateways/iDeleteAdminUserGateway";

export interface IDeleteAdminUserAction {
  execute(id: string): Promise<boolean>;
}

export const DeleteAdminUserAction = (
  gateway: IDeleteAdminUserGateway
): IDeleteAdminUserAction => {
  return {
    execute: async (id: string) => {
      try {
        return await gateway.deleteAdminUser(id);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};