import { IEnvironment } from "../entities/iEnvironment";
import { IGetEnvironmentGateway } from "../gateways/iGetEnvironmentGateway";

export interface IGetEnvironmentAction {
  execute(key: string): Promise<IEnvironment>;
}

export const GetEnvironmentAction = (
  gateway: IGetEnvironmentGateway
): IGetEnvironmentAction => {
  return {
    execute: async (key: string) => {
      return await gateway.getEnvironment(key);
    },
  };
};
