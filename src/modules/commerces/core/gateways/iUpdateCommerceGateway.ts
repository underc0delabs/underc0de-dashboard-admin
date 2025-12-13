import { ICommerce } from "../entities/iCommerce";

export interface IUpdateCommerceGateway {
  updateCommerce(id: string, commerce: Partial<ICommerce>): Promise<ICommerce>;
}