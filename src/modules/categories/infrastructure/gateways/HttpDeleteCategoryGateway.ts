import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IDeleteCategoryGateway } from "../../core/gateways/iDeleteCategoryGateway";
import { parseHttpClientError } from "@/utils/parseHttpClientError";

export const HttpDeleteCategoryGateway = (
  httpClient: IHttpClient,
): IDeleteCategoryGateway => ({
  deleteCategory: async (id) => {
    try {
      const response = await httpClient.delete(`/categories/${id}`);
      if (!response.status) {
        return Promise.reject(
          new Error(parseHttpClientError(response, "No se pudo eliminar la categoría.")),
        );
      }
    } catch (error) {
      return Promise.reject(
        new Error(parseHttpClientError(error, "No se pudo eliminar la categoría.")),
      );
    }
  },
});
