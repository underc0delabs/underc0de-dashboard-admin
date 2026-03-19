export interface IMetrics {
    users: number;
    merchants: number;
    notifications: number;
    subscriptions: number;
    subscriptionsActive?: number;
    subscriptionsCancelled?: number;
}