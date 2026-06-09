import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IUpdateCategoryGateway } from "../../core/gateways/iUpdateCategoryGateway";
import { ICategory } from "../../core/entities/iCategory";

export const HttpUpdateCategoryGateway = (
  httpClient: IHttpClient,
): IUpdateCategoryGateway => ({
  updateCategory: async (id, category) => {
    const response = await httpClient.patch(`/categories/${id}`, {
      name: category.name,
      status: category.status,
      sortOrder: category.sortOrder,
    });
    if (!response.status) {
      return Promise.reject(new Error(response.error.message));
    }
    const row = response.data as Record<string, unknown>;
    return {
      id: String(row.id ?? id),
      name: String(row.name ?? ""),
      status: Boolean(row.status ?? true),
      sortOrder: Number(row.sortOrder ?? 0),
    } satisfies ICategory;
  },
});
