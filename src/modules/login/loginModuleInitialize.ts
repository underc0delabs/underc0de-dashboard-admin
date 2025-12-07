import { DependencyManager } from "@/dependencyManager";
import { HttpLoginGateway } from "./infrastructure/gateways/HttpLoginGateway";
import { LoginAction } from "./core/actions/ILoginAction";
import { IHttpClient } from "../httpClient/interfaces";

export const loginModuleInitialize = (dependencyManager: DependencyManager) => {
    const loginGateway = HttpLoginGateway(dependencyManager.resolve('httpClient') as  IHttpClient)
    const loginAction = LoginAction(loginGateway);
    dependencyManager.register("loginAction", loginAction);
}