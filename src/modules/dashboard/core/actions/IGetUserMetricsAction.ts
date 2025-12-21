import { IMetrics } from "../entities/IMetrics";
import { IGetUsersMetricsGateway } from "../gateways/IGetUsersMetricsGateway";

export interface IGetUserMetricsAction {
  getUserMetrics: () => Promise<IMetrics>;
}

export const GetUserMetricsAction = (
  gateway: IGetUsersMetricsGateway
): IGetUserMetricsAction => {
  return {
    getUserMetrics: async () => {
      try {
        const metrics = await gateway.getUsersMetrics();
        return Promise.resolve(metrics);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};
