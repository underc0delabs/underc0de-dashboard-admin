import { IProfile, IProfileUpdatePayload } from "../entities/iProfile";
import { IUpdateProfileGateway } from "../gateways/iUpdateProfileGateway";

export interface IUpdateProfileAction {
  execute(id: string, payload: IProfileUpdatePayload): Promise<IProfile>;
}

export const UpdateProfileAction = (
  gateway: IUpdateProfileGateway
): IUpdateProfileAction => ({
  execute: (id: string, payload: IProfileUpdatePayload) =>
    gateway.update(id, payload),
});
