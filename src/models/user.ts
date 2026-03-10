export interface User {
  id?: number;             
  email: string;
  password?: string;       
  displayName?: string;
  identityNumber: string;
  phoneNumber: string;
  province: string;
  city: string;
  role?: "user" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
  DTO: {
    isVerfied: boolean;
    isBlocked: boolean;
    isActive: boolean;
    isDeleted: boolean;
  };
  hoursActive?: number | 0;
  
}