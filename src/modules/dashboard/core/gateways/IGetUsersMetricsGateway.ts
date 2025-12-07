import { IUserMetric } from "../entities/IUserMetric";

export interface IGetUsersMetricsGateway {
    getUsersMetrics: () => Promise<IUserMetric>;
}