import { IHttpClient } from "@/modules/httpClient/interfaces";
import { ICreateCategoryGateway } from "../../core/gateways/iCreateCategoryGateway";
import { ICategory } from "../../core/entities/iCategory";

export const HttpCreateCategoryGateway = (
  httpClient: IHttpClient,
): ICreateCategoryGateway => ({
  createCategory: async (category) => {
    const response = await httpClient.post("/categories", {
      name: category.name,
      status: category.status ?? true,
      sortOrder: category.sortOrder ?? 0,
    });
    if (!response.status) {
      return Promise.reject(new Error(response.error.message));
    }
    const row = response.data as Record<string, unknown>;
    return {
      id: String(row.id ?? ""),
      name: String(row.name ?? ""),
      status: Boolean(row.status ?? true),
      sortOrder: Number(row.sortOrder ?? 0),
    } satisfies ICategory;
  },
});
