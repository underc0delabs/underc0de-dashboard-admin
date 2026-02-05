import { IEnvironment } from "../entities/iEnvironment";

export interface IEnvironmentsViews {
  getEnvironmentSuccess: (environment: IEnvironment) => void;
  getEnvironmentError: (error: string) => void;
  updateEnvironmentSuccess: (environment: IEnvironment) => void;
  updateEnvironmentError: (error: string) => void;
}
