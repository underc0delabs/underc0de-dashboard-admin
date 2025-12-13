import { ICommerce } from "../entities/iCommerce";

export interface ICommerceViews {
    getCommercesSuccess(commerces: ICommerce[]): void;
    getCommercesError(error: Error): void;
    createCommerceSuccess(commerce: ICommerce): void;
    createCommerceError(error: Error): void;
    updateCommerceSuccess(commerce: ICommerce): void;
    updateCommerceError(error: Error): void;
    deleteCommerceSuccess(): void;
    deleteCommerceError(error: Error): void;
}