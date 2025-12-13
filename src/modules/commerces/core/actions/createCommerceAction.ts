import { ICommerce } from "../entities/iCommerce";
import { ICreateCommerceGateway } from "../gateways/iCreateCommerceGateway";

export interface ICreateCommerceAction {
  execute(commerce: Partial<ICommerce>): Promise<ICommerce>;
}

export const createCommerceAction = (
  createCommerceGateway: ICreateCommerceGateway
): ICreateCommerceAction => {
  return {
    execute: async (commerce: Partial<ICommerce>) => {
      return await createCommerceGateway.createCommerce(commerce);
    },
  };
};
