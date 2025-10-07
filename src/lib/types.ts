// Tipos para a plataforma CallStream

export interface Plan {
  id: string;
  duration: number;
  price: number;
  popular?: boolean;
}

export interface VideoData {
  id: string;
  name: string;
  duration: number;
  price: number;
  uploadDate: string;
  views: number;
  revenue: number;
  isActive: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface PaymentData {
  id: string;
  email: string;
  amount: number;
  duration: number;
  date: string;
  status: 'pending' | 'confirmed' | 'failed';
  paymentMethod?: string;
  transactionId?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  totalSpent: number;
  lastAccess: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalViews: number;
  todayPayments: number;
  activeVideos: number;
  totalUsers: number;
  conversionRate: number;
}

export interface CallSession {
  id: string;
  userId: string;
  videoId: string;
  duration: number;
  startTime: string;
  endTime?: string;
  completed: boolean;
}

// Constantes da plataforma
export const PLANS: Plan[] = [
  { id: "5min", duration: 5, price: 60 },
  { id: "10min", duration: 10, price: 100, popular: true },
  { id: "15min", duration: 15, price: 150 },
];

export const PAYMENT_STATUS = {
  PENDING: 'pending' as const,
  CONFIRMED: 'confirmed' as const,
  FAILED: 'failed' as const,
};

export const VIDEO_DURATIONS = [5, 10, 15] as const;
export const DEFAULT_PRICES = {
  5: 60,
  10: 100,
  15: 150,
} as const;