import { IDeleteCommerceGateway } from "../gateways/iDeleteCommerceGateway";

export interface IDeleteCommerceAction {
  execute(id: string): Promise<boolean>;
}

export const deleteCommerceAction = (
  deleteCommerceGateway: IDeleteCommerceGateway
): IDeleteCommerceAction => {
  return {
    execute: async (id: string) => {
      return await deleteCommerceGateway.deleteCommerce(id);
    },
  };
};
