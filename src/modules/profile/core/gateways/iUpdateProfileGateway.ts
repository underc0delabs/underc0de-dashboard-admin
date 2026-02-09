import { IProfile, IProfileUpdatePayload } from "../entities/iProfile";

export interface IUpdateProfileGateway {
  update(id: string, payload: IProfileUpdatePayload): Promise<IProfile>;
}
