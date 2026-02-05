import { IEnvironment } from "../entities/iEnvironment";

export interface IGetEnvironmentGateway {
  getEnvironment(key: string): Promise<IEnvironment>;
}
