import { IEnvironment } from "../entities/iEnvironment";
import { IUpdateEnvironmentGateway } from "../gateways/iUpdateEnvironmentGateway";

export interface IUpdateEnvironmentAction {
  execute(key: string, value: string): Promise<IEnvironment>;
}

export const UpdateEnvironmentAction = (
  gateway: IUpdateEnvironmentGateway
): IUpdateEnvironmentAction => {
  return {
    execute: async (key: string, value: string) => {
      return await gateway.updateEnvironment(key, value);
    },
  };
};
