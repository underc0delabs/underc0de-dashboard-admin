export interface ILoginGateway {
    login: (email: string, password: string) => Promise<any>;
  }
  
