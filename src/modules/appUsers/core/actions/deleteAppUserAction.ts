import { IDeleteAppUserGateway } from "../gateways/iDeleteAppUserGateway";

export interface IDeleteAppUserAction {
  execute(id: string): Promise<boolean>;
}

export const DeleteAppUserAction = (
  gateway: IDeleteAppUserGateway
): IDeleteAppUserAction => {
  return {
    execute: async (id: string) => {
      try {
        return await gateway.deleteAppUser(id);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};

