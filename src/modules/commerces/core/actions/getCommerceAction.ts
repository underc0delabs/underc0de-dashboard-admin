import { ICommerce } from "../entities/iCommerce";
import { IGetCommerceGateway } from "../gateways/iGetCommerceGateway";

export interface IGetCommerceAction {
  execute(): Promise<ICommerce[]>;
}

export const getCommerceAction = (
  getCommerceGateway: IGetCommerceGateway
): IGetCommerceAction => {
  return {
    execute: async () => {
      try {
        return await getCommerceGateway.getCommerces();
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};
