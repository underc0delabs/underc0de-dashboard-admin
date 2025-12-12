export interface IDeleteAdminUserGateway {
  deleteAdminUser(id: string): Promise<boolean>;
}