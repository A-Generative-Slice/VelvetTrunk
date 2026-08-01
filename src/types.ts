export type StallSeries = 'F' | 'S';

export type PaymentMode = 'UPI / QR Code' | 'Cash' | 'Bank Transfer' | 'Card';

export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';

export type StallCategory =
  | 'Clothing & Apparel'
  | 'Jewelry & Accessories'
  | 'Footwear & Bags'
  | 'Artisan & Handicrafts'
  | 'Home Decor'
  | 'Beauty & Cosmetics'
  | 'Gourmet Food & Beverages'
  | 'Electronics & Gadgets'
  | 'Other';

export interface PaymentTransaction {
  id: string;
  amount: number;
  paymentMode: PaymentMode;
  date: string;
  note?: string;
  createdAt: string;
}

export interface VendorBooking {
  id: string;
  eventId: string;
  series: StallSeries;
  exhibitorName: string;
  stallName: string;
  mobileNumber: string;
  stallNumber: string;
  bookingDate: string;
  stallCategory: StallCategory | string;
  stallRent: number;
  stallAdvance: number;
  remainingBalance: number;
  paymentMode: PaymentMode;
  calculatedStatus: PaymentStatus;
  notes?: string;
  paymentLogs?: PaymentTransaction[];
  createdAt: string;
}

export interface EventItem {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  timing: string;
  mapLocation: string;
  fSeriesLimit: number;
  sSeriesLimit: number;
  layoutImageUrl: string;
  bannerImageUrl?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventDashboardStats {
  totalStalls: number;
  stallsBooked: number;
  stallsAvailable: number;
  totalValue: number; // sum of stall rent
  totalCollected: number; // sum of advances/paid
  totalPending: number; // sum of remaining balance
  fBooked: number;
  fLimit: number;
  sBooked: number;
  sLimit: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
