export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled' | 'none';

export interface IAppUser {
  id?: string;
  email: string;
  name: string;
  phone?: string;
  subscription: SubscriptionStatus;
  subscriptionPlan?: string;
  subscriptionEndDate?: string;
  status: boolean;
  createdAt: string;
  updatedAt?: string;
}

