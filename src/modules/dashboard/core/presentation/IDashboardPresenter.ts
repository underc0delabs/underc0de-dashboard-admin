export interface IDashboardPresenter {
    getUserMetrics: () => void;
    getMerchantsMetrics: () => void;
    getNotificationsMetrics: () => void;
    getSubscriptionsMetrics: () => void;
}