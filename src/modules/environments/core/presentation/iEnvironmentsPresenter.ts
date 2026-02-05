import { IEnvironment } from "../entities/iEnvironment";

export interface IEnvironmentsPresenter {
  getEnvironment(key: string): void;
  updateEnvironment(key: string, value: string): void;
}
