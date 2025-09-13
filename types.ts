
export type UserRole = 'user' | 'admin';

export interface Plan {
  id: string;
  name: string;
  productType: 'Fibernet' | 'Broadband Copper';
  price: number;
  dataQuota: number; // in GB
  speed: string;
  features: string[];
  description: string;
}

export interface Discount {
  id: string;
  code: string;
  description: string;
  discountPercentage: number;
  applicablePlanIds: string[] | 'all';
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled';
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
}

export interface User {
  id:string;
  name: string;
  role: UserRole;
  subscriptionIds: string[];
  usage: { month: string, dataUsed: number }[]; // Monthly data usage in GB
}

export interface MonthlyTrend {
  month: string;
  active: number;
  cancelled: number;
}

export interface PlanPopularity {
  name: string;
  subscriptions: number;
}

export interface AnalyticsData {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyTrends: MonthlyTrend[];
  planPopularity: PlanPopularity[];
}
