import { IAppUser } from "../entities/iAppUser";
import { MercadoPagoSyncStatus } from "../gateways/iMercadoPagoSyncGateway";

export interface IAppUsersPresenter {
  getAppUsers(): void;
  updateAppUser(id: string, user: Partial<IAppUser>): void;
  createAppUser(user: Partial<IAppUser>): void;
  deleteAppUser(id: string): void;
  syncMercadoPago(): void;
  getMercadoPagoSyncStatus(): Promise<MercadoPagoSyncStatus>;
  reconcileMercadoPagoUser(userId: string): void;
}

