import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IGetCategoryGateway } from "../../core/gateways/iGetCategoryGateway";
import { ICategory } from "../../core/entities/iCategory";

const toCategory = (row: Record<string, unknown>): ICategory => ({
  id: String(row.id ?? ""),
  name: String(row.name ?? ""),
  status: Boolean(row.status ?? true),
  sortOrder: Number(row.sortOrder ?? 0),
});

export const HttpGetCategoryGateway = (
  httpClient: IHttpClient,
): IGetCategoryGateway => ({
  getCategories: async () => {
    const response = await httpClient.get("/categories");
    if (!response.status) {
      return Promise.reject(new Error(response.error.message));
    }
    const rows = Array.isArray(response.data) ? response.data : [];
    return rows.map((row) => toCategory(row as Record<string, unknown>));
  },
});
