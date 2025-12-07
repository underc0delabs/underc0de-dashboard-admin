import { IUserMetric } from "../entities/IUserMetric";
import { IGetUsersMetricsGateway } from "../gateways/IGetUsersMetricsGateway";

export interface IGetUserMetricsAction {
  getUserMetrics: () => Promise<IUserMetric>;
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
