import { IMetrics } from "../entities/IMetrics";

export interface IGetUsersMetricsGateway {
    getUsersMetrics: () => Promise<IMetrics>;
}