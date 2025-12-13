import { ICommerce } from "../entities/iCommerce";
import { IUpdateCommerceGateway } from "../gateways/iUpdateCommerceGateway";

export interface IUpdateCommerceAction {
  execute(id: string, commerce: Partial<ICommerce>): Promise<ICommerce>;
}

export const updateCommerceAction = (
  updateCommerceGateway: IUpdateCommerceGateway
): IUpdateCommerceAction => {
  return {
    execute: async (id: string, commerce: Partial<ICommerce>) => {
      return await updateCommerceGateway.updateCommerce(id, commerce);
    },
  };
};
