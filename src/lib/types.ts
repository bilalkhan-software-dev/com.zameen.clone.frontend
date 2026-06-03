export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  isAgency?: boolean;
  agencyName?: string;
  bio?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  userName: string;
  roles: string[];
  accountStatus: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PropertyFilterParams {
  City?: string;
  Address?: string;
  PropertyType?: string; 
  Status?: string;
  MinPrice?: number;
  MaxPrice?: number;
  MinBedrooms?: number;
  MaxBedrooms?: number;
  MinAreaSize?: number;
  MaxAreaSize?: number;
  SearchTerm?: string;
  Page?: number;
  PageSize?: number;
  SortBy?: string;
  IsDescending?: boolean;
   AreaUnit?: string;
}

export interface PropertyResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  city: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  areaSize: number;
  areaUnit: string;
  propertyPics: string[];
  propertyType: string;
  status: string;
  isActive: boolean;
  agent: AgentResponse;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  price: number;
  city: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  areaSize: number;
  areaUnit: string;
  propertyType: string;
  propertyPics?: string[];
}

// Agent
export interface AgentResponse {
  id: string;
  userId: string;
  agencyName: string;
  profilePic?: string;
  bio?: string;
  accountStatus: string; // "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAgentRequest {
  agencyName?: string;
  profilePic?: string;
  bio?: string;
}

export interface AgentFilterParams {
  page?: number;
  size?: number;
  status?: number; // enum AccountStatus
  sortBy?: string;
  isDescending?: boolean;
}

// Enquiry
export interface CreateEnquiryRequest {
  propertyId: number;
  senderName: string;
  senderEmail: string;
  phone?: string;
  message: string;
}

export interface EnquiryResponse {
  id: number;
  propertyId: number;
  senderName: string;
  senderEmail: string;
  phone?: string;
  message: string;
  createdAt: string;
}
