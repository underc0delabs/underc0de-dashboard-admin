import { IMetrics } from "../entities/IMetrics";

export interface IDashboardView {
    getMetrics: (metrics: IMetrics) => void;
    getMetricsError: (error: Error) => void;
}