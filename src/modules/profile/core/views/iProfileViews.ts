import { IProfile } from "../entities/iProfile";

export interface IProfileViews {
  getProfileSuccess: (profile: IProfile) => void;
  getProfileError: (error: string) => void;
  updateProfileSuccess: (profile: IProfile) => void;
  updateProfileError: (error: string) => void;
}
