import { IProfile, IProfileUpdatePayload } from "../entities/iProfile";

export interface IProfilePresenter {
  getProfile(id: string): void;
  updateProfile(id: string, payload: IProfileUpdatePayload): void;
}
