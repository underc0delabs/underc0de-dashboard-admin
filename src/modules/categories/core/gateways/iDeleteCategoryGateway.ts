export interface IDeleteCategoryGateway {
  deleteCategory: (id: string) => Promise<void>;
}
