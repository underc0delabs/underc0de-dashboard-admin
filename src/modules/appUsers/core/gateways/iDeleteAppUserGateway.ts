export interface IDeleteAppUserGateway {
  deleteAppUser(id: string): Promise<boolean>;
}

