import { ICommerce } from "../entities/iCommerce";

export interface ICreateCommerceGateway {
  createCommerce(commerce: Partial<ICommerce> ): Promise<ICommerce>;
}