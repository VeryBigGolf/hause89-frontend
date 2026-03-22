export interface User {
  _id: string;
  name: string;
  email: string;
  tel: string;
  role: "user" | "admin";
  token?: string;
  createdAt: string;
}

export interface Shop {
  _id: string;
  name: string;
  address: string;
  tel: string;
  openTime: string;
  closeTime: string;
}

export interface Appointment {
  _id: string;
  apptDate: string;
  user: string | User;
  shop: string | Shop;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  message?: string;
  pagination?: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  };
}

export interface LoginResponse {
  success: boolean;
  token: string;
}
