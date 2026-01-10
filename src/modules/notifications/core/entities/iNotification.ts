export interface INotification {
  id?: string;
  title: string;
  message: string;
  audience: 'todos' | 'usersPro' | 'normalUsers';
  userId?: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

