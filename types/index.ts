export type UserType = "CUSTOMER" | "BARBER";

export interface AuthUser {
  id: string;
  email: string;
  userType: UserType;
}

export interface CustomerProfileData {
  id: string;
  name: string;
  surname: string;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  city?: string | null;
}

export interface BarberProfileData {
  id: string;
  name: string;
  surname: string;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  city: string;
  district?: string | null;
  salonName?: string | null;
  avgService: number;
  avgQuality: number;
  avgPrice: number;
  reviewCount: number;
}

export interface PostWithRelations {
  id: string;
  createdAt: Date;
  caption?: string | null;
  customer: CustomerProfileData;
  barber: BarberProfileData;
  images: { id: string; url: string; order: number }[];
}

export interface CustomerToBarberReviewData {
  id: string;
  service: number;
  quality: number;
  price: number;
  comment?: string | null;
  createdAt: Date;
  customer: CustomerProfileData;
}

export interface BarberToCustomerReviewData {
  id: string;
  lateArrival: boolean;
  paymentIssue: boolean;
  noShow: boolean;
  overallScore: number;
  comment?: string | null;
  createdAt: Date;
  barber: BarberProfileData;
}
