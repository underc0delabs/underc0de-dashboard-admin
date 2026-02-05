import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IGetEnvironmentGateway } from "../../core/gateways/iGetEnvironmentGateway";
import { IEnvironment } from "../../core/entities/iEnvironment";

export const HttpGetEnvironmentGateway = (
  httpClient: IHttpClient
): IGetEnvironmentGateway => {
  const toEnvironment = (response: any, key: string): IEnvironment => {
    return {
      key,
      value: response.value || response.data?.value || "",
    };
  };

  return {
    getEnvironment: async (key: string) => {
      try {
        const response = await httpClient.get(`/environments/${key}`);
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
