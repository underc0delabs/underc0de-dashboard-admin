import { ICommerce } from "../entities/iCommerce";

export interface IGetCommerceGateway {
  getCommerces(): Promise<ICommerce[]>;
}