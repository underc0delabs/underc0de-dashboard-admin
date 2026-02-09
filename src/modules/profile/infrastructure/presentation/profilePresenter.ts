import { IGetProfileAction } from "../../core/actions/getProfileAction";
import { IUpdateProfileAction } from "../../core/actions/updateProfileAction";
import { IProfilePresenter } from "../../core/presentation/iProfilePresenter";
import { IProfileViews } from "../../core/views/iProfileViews";
import { IProfileUpdatePayload } from "../../core/entities/iProfile";

export const ProfilePresenter = (
  getProfileAction: IGetProfileAction,
  updateProfileAction: IUpdateProfileAction,
  viewHandlers: IProfileViews
): IProfilePresenter => ({
  getProfile: (id: string) => {
    getProfileAction
      .execute(id)
      .then(viewHandlers.getProfileSuccess)
      .catch((err: Error) => viewHandlers.getProfileError(err.message));
  },
  updateProfile: (id: string, payload: IProfileUpdatePayload) => {
    updateProfileAction
      .execute(id, payload)
      .then(viewHandlers.updateProfileSuccess)
      .catch((err: Error) => viewHandlers.updateProfileError(err.message));
  },
});
