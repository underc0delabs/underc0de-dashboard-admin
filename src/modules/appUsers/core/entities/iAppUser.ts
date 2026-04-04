export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled' | 'none';

export interface IAppUser {
  id?: string;
  email: string;
  mercadopago_email?: string;
  name: string;
  fullName?: string;
  lastname?: string;
  username?: string;
  phone?: string;
  /** ID del usuario en el foro (miembro interno). */
  forumUserId?: string;
  forumEmail?: string;
  mercadopagoCustomerId?: string;
  mercadopagoExternalReference?: string;
  subscription: SubscriptionStatus;
  subscriptionPlan?: string;
  subscriptionEndDate?: string;
  status: boolean;
  createdAt: string;
  updatedAt?: string;
  /** Solo al crear usuario desde el panel (opcional). */
  password?: string;
}

