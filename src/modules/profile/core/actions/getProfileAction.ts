import { IProfile } from "../entities/iProfile";
import { IGetProfileGateway } from "../gateways/iGetProfileGateway";

export interface IGetProfileAction {
  execute(id: string): Promise<IProfile>;
}

export const GetProfileAction = (
  gateway: IGetProfileGateway
): IGetProfileAction => ({
  execute: (id: string) => gateway.getById(id),
});
