import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IUpdateEnvironmentGateway } from "../../core/gateways/iUpdateEnvironmentGateway";
import { IEnvironment } from "../../core/entities/iEnvironment";

export const HttpUpdateEnvironmentGateway = (
  httpClient: IHttpClient
): IUpdateEnvironmentGateway => {
  const toEnvironment = (response: any, key: string): IEnvironment => {
    return {
      key,
      value: response.value || response.data?.value || "",
    };
  };

  return {
    updateEnvironment: async (key: string, value: string) => {
      try {
        const response = await httpClient.patch(`/environments/${key}`, {
          value,
        });
        if (!response.status) {
          return Promise.reject(new Error(response.error.message));
        }
        return Promise.resolve(toEnvironment(response.data, key));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};
