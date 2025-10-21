export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'store_owner';
  address?: string;
  rating?: number;
  created_at?: string;
}

export interface Store {
  id: number;
  name: string;
  email?: string;
  address: string;
  owner_id?: number;
  overall_rating?: number;
  rating?: number;
  total_ratings: number;
  user_rating?: number;
  created_at?: string;
}

export interface Rating {
  id: number;
  user_id?: number;
  store_id?: number;
  rating: number;
  rater_name?: string;
  user_name?: string;
  user_email?: string;
  comment?: string;
  created_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface StoreOwnerDashboardStore {
  store: {
    id: number;
    name: string;
  };
  averageRating: string;
  ratingUsers: Array<{
    name: string;
    email: string;
    rating: number;
    created_at: string;
  }>;
}

export interface StoreOwnerDashboard {
  stores: StoreOwnerDashboardStore[];
}