import { IUserMetric } from "../entities/IUserMetric";

export interface IDashboardView {
    userMetrics: (metrics: IUserMetric) => void;
    merchantsMetrics: (metrics: any) => void;
    notificationsMetrics: (metrics: any) => void;
    subscriptionsMetrics: (metrics: any) => void;
}