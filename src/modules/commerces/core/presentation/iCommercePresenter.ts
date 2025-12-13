import { ICommerce } from "../entities/iCommerce";

export interface ICommercePresenter {
    getCommerces(): void;
    createCommerce(commerce: Partial<ICommerce>): void;
    updateCommerce(id: string, commerce: Partial<ICommerce>): void;
    deleteCommerce(id: string): void;
}