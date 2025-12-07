/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
export interface IPresenterProvider<T extends any, R extends any> {
    getPresenter(viewHandlers: T): R;
  }
  