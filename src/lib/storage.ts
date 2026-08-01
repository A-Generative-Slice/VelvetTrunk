import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EventItem, VendorBooking, SupabaseConfig, PaymentStatus } from '../types';

const EVENTS_STORAGE_KEY = 'velvet_trunk_events_v2';
const BOOKINGS_STORAGE_KEY = 'velvet_trunk_bookings_v2';
const SUPABASE_CONFIG_KEY = 'velvet_trunk_supabase_cfg';

// Default layout JPG image (Base64 or high quality luxury stall layout SVG/data URI)
export const DEFAULT_LAYOUT_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none"><rect width="800" height="600" fill="%23FFF7FA"/><rect x="20" y="20" width="760" height="560" rx="16" fill="%23F4ECEF" stroke="%2381737C" stroke-width="2" stroke-dasharray="8 8"/><text x="400" y="60" text-anchor="middle" fill="%23491546" font-family="sans-serif" font-size="22" font-weight="bold">THE VELVET TRUNK - EXHIBITION FLOOR PLAN</text><rect x="60" y="100" width="680" height="180" rx="12" fill="%23632C5E" fill-opacity="0.08" stroke="%23491546" stroke-width="1.5"/><text x="400" y="125" text-anchor="middle" fill="%23491546" font-family="sans-serif" font-size="16" font-weight="bold">F-SERIES ZONE (F-01 to F-100) — PREMIUM FRONT PAVILION</text><g fill="%23491546" fill-opacity="0.15" stroke="%23491546" stroke-width="1"><rect x="80" y="140" width="55" height="40" rx="4"/><text x="107" y="165" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-01</text><rect x="145" y="140" width="55" height="40" rx="4"/><text x="172" y="165" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-02</text><rect x="210" y="140" width="55" height="40" rx="4"/><text x="237" y="165" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-03</text><rect x="275" y="140" width="55" height="40" rx="4"/><text x="302" y="165" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-04</text><rect x="340" y="140" width="55" height="40" rx="4"/><text x="367" y="165" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-05</text><rect x="405" y="140" width="55" height="40" rx="4"/><text x="432" y="165" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-06</text><rect x="470" y="140" width="55" height="40" rx="4"/><text x="497" y="165" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-07</text><rect x="535" y="140" width="55" height="40" rx="4"/><text x="562" y="165" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-08</text><rect x="600" y="140" width="55" height="40" rx="4"/><text x="627" y="165" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-09</text><rect x="665" y="140" width="55" height="40" rx="4"/><text x="692" y="165" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-10</text></g><g fill="%23491546" fill-opacity="0.15" stroke="%23491546" stroke-width="1"><rect x="80" y="210" width="55" height="40" rx="4"/><text x="107" y="235" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-11</text><rect x="145" y="210" width="55" height="40" rx="4"/><text x="172" y="235" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-12</text><rect x="210" y="210" width="55" height="40" rx="4"/><text x="237" y="235" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-13</text><rect x="275" y="210" width="55" height="40" rx="4"/><text x="302" y="235" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-14</text><rect x="340" y="210" width="55" height="40" rx="4"/><text x="367" y="235" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-15</text><rect x="405" y="210" width="55" height="40" rx="4"/><text x="432" y="235" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-16</text><rect x="470" y="210" width="55" height="40" rx="4"/><text x="497" y="235" text-anchor="middle" fill="%23491546" font-size="11" font-weight="bold">F-17</text><text x="600" y="235" fill="%2381737C" font-size="12">... to F-100</text></g><rect x="60" y="320" width="680" height="150" rx="12" fill="%23904277" fill-opacity="0.08" stroke="%23904277" stroke-width="1.5"/><text x="400" y="345" text-anchor="middle" fill="%23904277" font-family="sans-serif" font-size="16" font-weight="bold">S-SERIES ZONE (S-01 to S-20) — SELECT VIP LOUNGE</text><g fill="%23904277" fill-opacity="0.2" stroke="%23904277" stroke-width="1"><rect x="90" y="370" width="100" height="70" rx="6"/><text x="140" y="410" text-anchor="middle" fill="%23491546" font-size="14" font-weight="bold">S-01</text><rect x="210" y="370" width="100" height="70" rx="6"/><text x="260" y="410" text-anchor="middle" fill="%23491546" font-size="14" font-weight="bold">S-02</text><rect x="330" y="370" width="100" height="70" rx="6"/><text x="380" y="410" text-anchor="middle" fill="%23491546" font-size="14" font-weight="bold">S-03</text><rect x="450" y="370" width="100" height="70" rx="6"/><text x="500" y="410" text-anchor="middle" fill="%23491546" font-size="14" font-weight="bold">S-04</text><rect x="570" y="370" width="100" height="70" rx="6"/><text x="620" y="410" text-anchor="middle" fill="%23491546" font-size="14" font-weight="bold">S-05</text></g><rect x="60" y="490" width="680" height="60" rx="8" fill="%23E9E0E4"/><text x="400" y="525" text-anchor="middle" fill="%231E1A1D" font-size="14" font-weight="bold">MAIN ENTRANCE / REGISTRATION DESK / CAFE LOUNGE</text></svg>`;

export const SAMPLE_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    name: 'Summer Artisan Gala 2026',
    location: 'The Grand Starlight Pavilion, Bandra West, Mumbai',
    startDate: '2026-08-15',
    endDate: '2026-08-17',
    timing: '11:00 AM - 10:00 PM',
    mapLocation: 'https://maps.google.com/?q=The+Grand+Starlight+Pavilion+Mumbai',
    fSeriesLimit: 100,
    sSeriesLimit: 20,
    layoutImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGvxEr6Ae9KJJTmuFfbqgu-wPHYW_et21eiKS4-BlOFP1XIG0j7c0TWkQkfZ_HRHB6Zi8Vu01LtMZ2Rb8mHalmSnPNccsZ8YRhoctnTHqAWPTXR75ofKF-ZBnfhCK-4i6RVXQlU2-9JmUQE09YCy0s74Uod0ZUJa3pw6wzFrMd0nzdT6T7Yrewr_aSP7IuARgvPT_UXt_4__pOljjNk_-cC_1xEcE4QtlAuRwW0oSms6MB-ZkYCG41',
    bannerImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGvxEr6Ae9KJJTmuFfbqgu-wPHYW_et21eiKS4-BlOFP1XIG0j7c0TWkQkfZ_HRHB6Zi8Vu01LtMZ2Rb8mHalmSnPNccsZ8YRhoctnTHqAWPTXR75ofKF-ZBnfhCK-4i6RVXQlU2-9JmUQE09YCy0s74Uod0ZUJa3pw6wzFrMd0nzdT6T7Yrewr_aSP7IuARgvPT_UXt_4__pOljjNk_-cC_1xEcE4QtlAuRwW0oSms6MB-ZkYCG41',
    isCompleted: false,
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-28T14:20:00Z',
  },
  {
    id: 'evt-2',
    name: 'Royal Velvet Festive Trunk Show',
    location: 'JW Marriott Hotel Ballroom, Juhu, Mumbai',
    startDate: '2026-09-02',
    endDate: '2026-09-04',
    timing: '10:00 AM - 09:00 PM',
    mapLocation: 'https://maps.google.com/?q=JW+Marriott+Hotel+Juhu+Mumbai',
    fSeriesLimit: 80,
    sSeriesLimit: 15,
    layoutImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTTq8dslCVM4HE0vmwQbPB63sjEM9NNty44coB1wRe0QQloXdjWbO8bP53fF6i_-m2mlGk7Tsk6SQGt-WoY6mzEcGs2_5fn-2u5sKYlZEYvm7ObzRMhWOGHBL5dnn184u-7tlZmiMLJiKKN_Nz6qWk2xLvHKIIAI8VGiDoIAwcuIFmooAwo3qSPeGqnaIGIQJA4vbgUaqewthvlD8wn2b_ggcugQOVFnywrkutOwZWP1eG-pk2E9g7',
    bannerImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTTq8dslCVM4HE0vmwQbPB63sjEM9NNty44coB1wRe0QQloXdjWbO8bP53fF6i_-m2mlGk7Tsk6SQGt-WoY6mzEcGs2_5fn-2u5sKYlZEYvm7ObzRMhWOGHBL5dnn184u-7tlZmiMLJiKKN_Nz6qWk2xLvHKIIAI8VGiDoIAwcuIFmooAwo3qSPeGqnaIGIQJA4vbgUaqewthvlD8wn2b_ggcugQOVFnywrkutOwZWP1eG-pk2E9g7',
    isCompleted: false,
    createdAt: '2026-07-22T08:00:00Z',
    updatedAt: '2026-07-29T11:00:00Z',
  },
  {
    id: 'evt-3',
    name: 'Diwali Luxury Couture Expo 2025',
    location: 'Taj Mahal Palace Convention Centre, Colaba',
    startDate: '2025-10-18',
    endDate: '2025-10-21',
    timing: '10:30 AM - 08:30 PM',
    mapLocation: 'https://maps.google.com/?q=Taj+Mahal+Palace+Mumbai',
    fSeriesLimit: 100,
    sSeriesLimit: 20,
    layoutImageUrl: DEFAULT_LAYOUT_IMAGE,
    isCompleted: true,
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-10-22T18:00:00Z',
  },
  {
    id: 'evt-4',
    name: 'Spring Heritage Craft Fair 2025',
    location: 'World Trade Center Expo Hall, Cuffe Parade',
    startDate: '2025-03-12',
    endDate: '2025-03-15',
    timing: '11:00 AM - 09:00 PM',
    mapLocation: 'https://maps.google.com/?q=World+Trade+Center+Mumbai',
    fSeriesLimit: 90,
    sSeriesLimit: 18,
    layoutImageUrl: DEFAULT_LAYOUT_IMAGE,
    isCompleted: true,
    createdAt: '2025-02-10T10:00:00Z',
    updatedAt: '2025-03-16T19:00:00Z',
  },
];

export const SAMPLE_BOOKINGS: VendorBooking[] = [
  {
    id: 'bk-101',
    eventId: 'evt-1',
    series: 'F',
    exhibitorName: 'John Doe',
    stallName: 'Classic Threads',
    mobileNumber: '9876543210',
    stallNumber: 'F-04',
    bookingDate: '2026-07-29',
    stallCategory: 'Clothing & Apparel',
    stallRent: 25000,
    stallAdvance: 15000,
    remainingBalance: 10000,
    paymentMode: 'UPI / QR Code',
    calculatedStatus: 'Partial',
    notes: 'Requested extra display lights.',
    createdAt: '2026-07-29T10:30:00Z',
  },
  {
    id: 'bk-102',
    eventId: 'evt-1',
    series: 'F',
    exhibitorName: 'Priya Sharma',
    stallName: 'Aura Fine Jewelry',
    mobileNumber: '9820112233',
    stallNumber: 'F-12',
    bookingDate: '2026-07-28',
    stallCategory: 'Jewelry & Accessories',
    stallRent: 30000,
    stallAdvance: 30000,
    remainingBalance: 0,
    paymentMode: 'UPI / QR Code',
    calculatedStatus: 'Paid',
    notes: 'Requires glass cabinet lock.',
    createdAt: '2026-07-28T14:15:00Z',
  },
  {
    id: 'bk-103',
    eventId: 'evt-1',
    series: 'F',
    exhibitorName: 'Rohan Mehta',
    stallName: 'Urban Sole Footwear',
    mobileNumber: '9930445566',
    stallNumber: 'F-08',
    bookingDate: '2026-07-29',
    stallCategory: 'Footwear & Bags',
    stallRent: 22000,
    stallAdvance: 0,
    remainingBalance: 22000,
    paymentMode: 'Cash',
    calculatedStatus: 'Unpaid',
    notes: 'Advance promised by tomorrow.',
    createdAt: '2026-07-29T16:00:00Z',
  },
  {
    id: 'bk-104',
    eventId: 'evt-1',
    series: 'S',
    exhibitorName: 'Ananya Roy',
    stallName: 'Velvet Heritage Silk',
    mobileNumber: '9811223344',
    stallNumber: 'S-01',
    bookingDate: '2026-07-25',
    stallCategory: 'Clothing & Apparel',
    stallRent: 45000,
    stallAdvance: 45000,
    remainingBalance: 0,
    paymentMode: 'Bank Transfer',
    calculatedStatus: 'Paid',
    notes: 'VIP S-series Corner Pavilion.',
    createdAt: '2026-07-25T09:00:00Z',
  },
  {
    id: 'bk-105',
    eventId: 'evt-1',
    series: 'S',
    exhibitorName: 'Vikramaditya Rao',
    stallName: 'Royal Diamond Studio',
    mobileNumber: '9765432109',
    stallNumber: 'S-02',
    bookingDate: '2026-07-26',
    stallCategory: 'Jewelry & Accessories',
    stallRent: 50000,
    stallAdvance: 25000,
    remainingBalance: 25000,
    paymentMode: 'UPI / QR Code',
    calculatedStatus: 'Partial',
    notes: 'Requires security camera spot.',
    createdAt: '2026-07-26T11:45:00Z',
  },
  // Previous completed event sample bookings
  {
    id: 'bk-201',
    eventId: 'evt-3',
    series: 'F',
    exhibitorName: 'Sunita Kapoor',
    stallName: 'Ethnic Elegance',
    mobileNumber: '9820011223',
    stallNumber: 'F-01',
    bookingDate: '2025-10-01',
    stallCategory: 'Clothing & Apparel',
    stallRent: 20000,
    stallAdvance: 20000,
    remainingBalance: 0,
    paymentMode: 'UPI / QR Code',
    calculatedStatus: 'Paid',
    createdAt: '2025-10-01T10:00:00Z',
  },
  {
    id: 'bk-202',
    eventId: 'evt-3',
    series: 'S',
    exhibitorName: 'Meera Rajput',
    stallName: 'Heritage Couture',
    mobileNumber: '9821122334',
    stallNumber: 'S-01',
    bookingDate: '2025-10-02',
    stallCategory: 'Clothing & Apparel',
    stallRent: 40000,
    stallAdvance: 40000,
    remainingBalance: 0,
    paymentMode: 'Card',
    calculatedStatus: 'Paid',
    createdAt: '2025-10-02T12:00:00Z',
  },
];

// Calculation helper for vendor payment status
export function calculatePaymentStatus(rent: number, advance: number): {
  remaining: number;
  status: PaymentStatus;
} {
  const safeRent = Math.max(0, rent || 0);
  const safeAdvance = Math.max(0, advance || 0);
  const remaining = Math.max(0, safeRent - safeAdvance);

  let status: PaymentStatus = 'Unpaid';
  if (safeAdvance >= safeRent && safeRent > 0) {
    status = 'Paid';
  } else if (safeAdvance > 0) {
    status = 'Partial';
  } else {
    status = 'Unpaid';
  }

  return { remaining, status };
}

// Local Storage helpers
export function getLocalEvents(): EventItem[] {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(SAMPLE_EVENTS));
      return SAMPLE_EVENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read local events:', err);
    return SAMPLE_EVENTS;
  }
}

export function saveLocalEvents(events: EventItem[]): void {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save local events:', err);
  }
}

export function getLocalBookings(): VendorBooking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(SAMPLE_BOOKINGS));
      return SAMPLE_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read local bookings:', err);
    return SAMPLE_BOOKINGS;
  }
}

export function saveLocalBookings(bookings: VendorBooking[]): void {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (err) {
    console.error('Failed to save local bookings:', err);
  }
}

// Supabase helper
export function getSupabaseConfig(): SupabaseConfig | null {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch (err) {
    console.error('Error reading Supabase config:', err);
  }
  return null;
}

export function saveSupabaseConfig(cfg: SupabaseConfig): void {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(cfg));
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
}

export function getSupabaseClient(): SupabaseClient | null {
  const cfg = getSupabaseConfig();
  if (cfg && cfg.url && cfg.anonKey) {
    try {
      return createClient(cfg.url, cfg.anonKey);
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
    }
  }
  return null;
}

// Stats calculator for an event
export function calculateEventDashboardStats(
  event: EventItem,
  bookings: VendorBooking[]
) {
  const eventBookings = bookings.filter((b) => b.eventId === event.id);

  const fBookings = eventBookings.filter((b) => b.series === 'F');
  const sBookings = eventBookings.filter((b) => b.series === 'S');

  const fBooked = fBookings.length;
  const sBooked = sBookings.length;

  const totalStallsLimit = event.fSeriesLimit + event.sSeriesLimit;
  const stallsBooked = eventBookings.length;
  const stallsAvailable = Math.max(0, totalStallsLimit - stallsBooked);

  let totalValue = 0;
  let totalCollected = 0;
  let totalPending = 0;

  let paidCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;

  eventBookings.forEach((b) => {
    totalValue += b.stallRent || 0;
    totalCollected += b.stallAdvance || 0;
    totalPending += b.remainingBalance || 0;

    if (b.calculatedStatus === 'Paid') paidCount++;
    else if (b.calculatedStatus === 'Partial') partialCount++;
    else unpaidCount++;
  });

  return {
    totalStalls: totalStallsLimit,
    stallsBooked,
    stallsAvailable,
    totalValue,
    totalCollected,
    totalPending,
    fBooked,
    fLimit: event.fSeriesLimit,
    sBooked,
    sLimit: event.sSeriesLimit,
    paidCount,
    partialCount,
    unpaidCount,
  };
}

// SQL Generator helper for Supabase table creation
export const SUPABASE_SETUP_SQL = `-- Run this in your Supabase SQL Editor to create tables for The Velvet Trunk

-- 1. Create Events Table
create table if not exists public.events (
  id text primary key,
  name text not null,
  location text not null,
  start_date text not null,
  end_date text not null,
  timing text not null,
  map_location text,
  f_series_limit integer default 100,
  s_series_limit integer default 20,
  layout_image_url text,
  banner_image_url text,
  is_completed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Create Stall Bookings Table
create table if not exists public.stall_bookings (
  id text primary key,
  event_id text references public.events(id) on delete cascade,
  series text check (series in ('F', 'S')),
  exhibitor_name text not null,
  stall_name text not null,
  mobile_number text not null,
  stall_number text not null,
  booking_date text not null,
  stall_category text not null,
  stall_rent numeric default 0,
  stall_advance numeric default 0,
  remaining_balance numeric default 0,
  payment_mode text default 'UPI / QR Code',
  calculated_status text default 'Unpaid',
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS) & Allow Public Read/Write for demo PWA
alter table public.events enable row level security;
alter table public.stall_bookings enable row level security;

create policy "Allow anonymous access on events" on public.events for all using (true) with check (true);
create policy "Allow anonymous access on stall_bookings" on public.stall_bookings for all using (true) with check (true);
`;
