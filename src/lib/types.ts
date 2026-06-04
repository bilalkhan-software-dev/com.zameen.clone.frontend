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
  contactNumber?: string;
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
  Location?: string;
  PropertyType?: string;
  PropertyPurpose?: string;
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
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  price: number;
  city: string;
  address: string;
  location: string; // society/area name
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  areaSize: number; // will be in square feet (converted from user input)
  propertyType: string; // "HOUSE", "FLAT", "COMMERCIAL", "SHOP"
  propertyPurpose: string; // "BUY" or "RENT"
  propertyPics: string[]; // array of image URLs
  amenities: Record<string, any>; // JSON object for all amenities
}

export interface PropertyResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  city: string;
  address: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  areaSize: number; // in square feet
  propertyPics: string[];
  propertyType: string;
  propertyPurpose: string;
  status: string; // "PENDING", "APPROVED", etc.
  isActive: boolean;
  agent: AgentResponse;
  latitude: number;
  longitude: number;
  amenities: Record<string, any>; // deserialized JSON
  createdAt: string;
  updatedAt: string;
}

// Agent
export interface AgentResponse {
  id: string;
  userId: string;
  agencyName: string;
  profilePic?: string;
  bio?: string;
  accountStatus: string; // "PENDING" | "APPROVED" | "REJECTED"
  contactNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAgentRequest {
  agencyName?: string;
  contactNumber?: string;
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
