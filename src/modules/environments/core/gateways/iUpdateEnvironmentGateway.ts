import { IEnvironment } from "../entities/iEnvironment";

export interface IUpdateEnvironmentGateway {
  updateEnvironment(key: string, value: string): Promise<IEnvironment>;
}
