export interface IDeleteNotificationGateway {
  deleteNotification(id: string): Promise<boolean>;
}

