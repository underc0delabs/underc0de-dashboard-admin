export interface IDeleteCommerceGateway {
  deleteCommerce(id: string): Promise<boolean>;
}