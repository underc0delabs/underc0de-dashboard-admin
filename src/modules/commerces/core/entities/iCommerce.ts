export interface ICommerce {
  id?: string;
  name: string;
  category?: string;
  address: string;
  phone?: string;
  email?: string;
  status: boolean;
  logo?: string;
  usersProDisccount?: number | null;
  usersDisccount?: number | null;
  url?: string;
  detail?: string;
  createdAt: string;
  updatedAt?: string;
}