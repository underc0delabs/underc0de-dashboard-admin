import { IProfile } from "../entities/iProfile";

export interface IGetProfileGateway {
  getById(id: string): Promise<IProfile>;
}
