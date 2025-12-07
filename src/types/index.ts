export type UserRole = 'admin' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  subscription: SubscriptionStatus;
  subscriptionPlan?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'suspended';
}

export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled' | 'none';

export interface Commerce {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'pending';
  ownerId: string;
  createdAt: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'users' | 'commerces' | 'specific';
  scheduledAt?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  createdAt: string;
  createdBy: string;
}

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
