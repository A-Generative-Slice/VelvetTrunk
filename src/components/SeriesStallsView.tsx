import React, { useState } from 'react';
import {
  EventItem,
  VendorBooking,
  StallSeries,
  PaymentMode,
  StallCategory,
  PaymentStatus,
} from '../types';
import { calculatePaymentStatus } from '../lib/storage';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  User,
  Store,
  Calendar,
  Tag,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Layers,
  X,
  CreditCard,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface SeriesStallsViewProps {
  event: EventItem;
  series: StallSeries; // 'F' or 'S'
  bookings: VendorBooking[];
  onSaveBooking: (bookingData: Omit<VendorBooking, 'id' | 'createdAt'>, existingId?: string) => void;
  onDeleteBooking: (bookingId: string) => void;
  onBack: () => void;
}

const STALL_CATEGORIES: StallCategory[] = [
  'Clothing & Apparel',
  'Jewelry & Accessories',
  'Footwear & Bags',
  'Artisan & Handicrafts',
  'Home Decor',
  'Beauty & Cosmetics',
  'Gourmet Food & Beverages',
  'Electronics & Gadgets',
  'Other',
];

const PAYMENT_MODES: PaymentMode[] = [
  'UPI / QR Code',
  'Cash',
  'Bank Transfer',
  'Card',
];

export const SeriesStallsView: React.FC<SeriesStallsViewProps> = ({
  event,
  series,
  bookings,
  onSaveBooking,
  onDeleteBooking,
  onBack,
}) => {
  const isF = series === 'F';
  const seriesTitle = isF ? 'F Series (Front Pavilion)' : 'S Series (VIP Select)';
  const limit = isF ? event.fSeriesLimit : event.sSeriesLimit;

  // Filter bookings for this event and this specific series
  const seriesBookings = bookings.filter(
    (b) => b.eventId === event.id && b.series === series
  );

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal / Form State for Add or Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<VendorBooking | null>(null);

  // Form Fields
  const [exhibitorName, setExhibitorName] = useState('');
  const [stallName, setStallName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [stallNumber, setStallNumber] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-07-29');
  const [stallCategory, setStallCategory] = useState<string>('Clothing & Apparel');
  const [stallRent, setStallRent] = useState<number | ''>(25000);
  const [stallAdvance, setStallAdvance] = useState<number | ''>(15000);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI / QR Code');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Auto calculate remaining balance & calculated status dynamically
  const rentVal = typeof stallRent === 'number' ? stallRent : 0;
  const advanceVal = typeof stallAdvance === 'number' ? stallAdvance : 0;
  const { remaining: calculatedRemaining, status: calculatedStatus } =
    calculatePaymentStatus(rentVal, advanceVal);

  const openAddModal = () => {
    setEditingBooking(null);
    setExhibitorName('');
    setStallName('');
    setMobileNumber('');
    // Auto generate default stall number like F-01 or S-01 based on current count
    const nextNum = (seriesBookings.length + 1).toString().padStart(2, '0');
    setStallNumber(`${series}-${nextNum}`);
    setBookingDate(new Date().toISOString().split('T')[0]);
    setStallCategory('Clothing & Apparel');
    setStallRent(series === 'S' ? 45000 : 25000);
    setStallAdvance(series === 'S' ? 25000 : 15000);
    setPaymentMode('UPI / QR Code');
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (booking: VendorBooking) => {
    setEditingBooking(booking);
    setExhibitorName(booking.exhibitorName);
    setStallName(booking.stallName);
    setMobileNumber(booking.mobileNumber);
    setStallNumber(booking.stallNumber);
    setBookingDate(booking.bookingDate);
    setStallCategory(booking.stallCategory);
    setStallRent(booking.stallRent);
    setStallAdvance(booking.stallAdvance);
    setPaymentMode(booking.paymentMode);
    setNotes(booking.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exhibitorName.trim()) {
      setFormError('Exhibitor Name is required.');
      return;
    }
    if (!stallName.trim()) {
      setFormError('Stall Name is required.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      setFormError('Please enter a valid 10-digit Mobile Number.');
      return;
    }
    if (!stallNumber.trim()) {
      setFormError('Stall Number is required.');
      return;
    }

    // Check duplicate stall number in this event
    const duplicate = bookings.find(
      (b) =>
        b.eventId === event.id &&
        b.stallNumber.toLowerCase() === stallNumber.trim().toLowerCase() &&
        b.id !== editingBooking?.id
    );

    if (duplicate) {
      setFormError(`Stall number "${stallNumber}" is already booked for ${duplicate.exhibitorName}!`);
      return;
    }

    onSaveBooking(
      {
        eventId: event.id,
        series,
        exhibitorName: exhibitorName.trim(),
        stallName: stallName.trim(),
        mobileNumber: mobileNumber.trim(),
        stallNumber: stallNumber.trim().toUpperCase(),
        bookingDate,
        stallCategory,
        stallRent: rentVal,
        stallAdvance: advanceVal,
        remainingBalance: calculatedRemaining,
        paymentMode,
        calculatedStatus,
        notes,
      },
      editingBooking?.id
    );

    setIsModalOpen(false);
  };

  // Filter vendor list
  const filteredBookings = seriesBookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.exhibitorName.toLowerCase().includes(q) ||
      b.stallName.toLowerCase().includes(q) ||
      b.stallNumber.toLowerCase().includes(q) ||
      b.mobileNumber.includes(q) ||
      b.stallCategory.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'All' || b.calculatedStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Series Quick Stats
  let seriesRentTotal = 0;
  let seriesAdvanceTotal = 0;
  let seriesPendingTotal = 0;

  seriesBookings.forEach((b) => {
    seriesRentTotal += b.stallRent || 0;
    seriesAdvanceTotal += b.stallAdvance || 0;
    seriesPendingTotal += b.remainingBalance || 0;
  });

  return (
    <div className="flex flex-col gap-5 pb-28 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#e9e0e4] flex items-center justify-center text-[#491546] shadow-xs active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold text-white uppercase ${
                  isF ? 'bg-[#632c5e]' : 'bg-[#904277]'
                }`}
              >
                {series} SERIES
              </span>
              <h1 className="text-base font-bold text-[#491546]">{event.name}</h1>
            </div>
            <p className="text-xs text-[#81737c] mt-0.5">
              {seriesBookings.length} of {limit} Stalls Allocated
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className={`p-2.5 rounded-xl text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1 ${
            isF ? 'bg-[#491546] hover:bg-[#632c5e]' : 'bg-[#904277] hover:bg-[#7c3165]'
          }`}
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Stall
        </button>
      </div>

      {/* Series Financial Summary Strip */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#e9e0e4] p-3.5 shadow-2xs grid grid-cols-3 gap-2 text-center">
        <div>
          <span className="text-[10px] text-[#81737c] font-bold uppercase block">
            Stalls
          </span>
          <span className="text-xs font-extrabold text-[#491546]">
            {seriesBookings.length} / {limit}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#81737c] font-bold uppercase block">
            Collected
          </span>
          <span className="text-xs font-extrabold text-emerald-700">
            ₹{seriesAdvanceTotal.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#81737c] font-bold uppercase block">
            Pending
          </span>
          <span className="text-xs font-extrabold text-amber-700">
            ₹{seriesPendingTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Search Bar & Status Filter */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <label htmlFor="search-bookings-input" className="text-[11px] font-extrabold uppercase tracking-wider text-[#491546]">
            Filter Bookings by Exhibitor Name or Stall No.
          </label>
          {searchQuery && (
            <span className="text-[10px] font-bold text-[#904277] bg-[#faf1f5] px-2 py-0.5 rounded-md">
              {filteredBookings.length} of {seriesBookings.length} Found
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#81737c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="search-bookings-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search by exhibitor name, stall number (e.g. ${series}-01), stall name...`}
            className="w-full pl-10 pr-9 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-semibold text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] shadow-2xs placeholder:text-[#a599a2]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#e9e0e4] text-[#491546] hover:bg-[#d2c2cc] flex items-center justify-center transition-colors"
              title="Clear search filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['All', 'Paid', 'Partial', 'Unpaid'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#491546] text-white shadow-xs'
                  : 'bg-[#ffffff] text-[#81737c] border border-[#e9e0e4] hover:bg-[#faf1f5]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor List */}
      <div className="flex flex-col gap-3">
        {filteredBookings.length === 0 ? (
          <div className="bg-[#ffffff] p-8 text-center rounded-2xl border border-[#e9e0e4] text-[#81737c] space-y-3">
            <p className="font-bold text-sm text-[#491546]">No Vendor Bookings Found</p>
            <p className="text-xs">
              {searchQuery
                ? `No booking matching exhibitor name or stall number "${searchQuery}" in ${series} Series.`
                : `No stalls allocated in ${series} Series yet. Click "Add Stall" above.`}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-[#faf1f5] text-[#491546] border border-[#d2c2cc] text-xs font-bold rounded-xl active:scale-95 transition-all inline-flex items-center gap-1.5"
              >
                <X className="w-4 h-4" /> Clear Search Filter
              </button>
            ) : (
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-[#491546] text-white text-xs font-bold rounded-xl active:scale-95 transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add First Vendor
              </button>
            )}
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-[#ffffff] rounded-2xl border border-[#e9e0e4] p-4 shadow-2xs hover:shadow-xs transition-all space-y-3"
            >
              {/* Header with Stall Number and Payment Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#491546] text-white font-black text-xs tracking-wider">
                      {b.stallNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-[#81737c] bg-[#faf1f5] px-2 py-0.5 rounded-md">
                      {b.stallCategory}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-[#1e1a1d] leading-tight">
                    {b.stallName}
                  </h3>
                  <p className="text-xs text-[#4f434c] font-medium flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-[#904277]" /> {b.exhibitorName}
                  </p>
                </div>

                {/* Status Pill */}
                <div
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                    b.calculatedStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.calculatedStatus === 'Partial'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {b.calculatedStatus === 'Paid' && <CheckCircle className="w-3 h-3" />}
                  {b.calculatedStatus === 'Partial' && <AlertTriangle className="w-3 h-3" />}
                  {b.calculatedStatus === 'Unpaid' && <XCircle className="w-3 h-3" />}
                  <span>{b.calculatedStatus}</span>
                </div>
              </div>

              {/* Contact & Date */}
              <div className="grid grid-cols-2 gap-2 text-xs text-[#4f434c] bg-[#faf1f5]/70 p-2.5 rounded-xl">
                <a
                  href={`tel:${b.mobileNumber}`}
                  className="flex items-center gap-1.5 font-bold text-[#491546] hover:underline"
                >
                  <Phone className="w-3.5 h-3.5 text-[#904277]" />
                  <span>{b.mobileNumber}</span>
                </a>
                <div className="flex items-center gap-1.5 text-[#81737c] justify-end">
                  <Calendar className="w-3.5 h-3.5 text-[#904277]" />
                  <span>Booked: {b.bookingDate}</span>
                </div>
              </div>

              {/* Financial Rent Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-[#f4ecef]">
                <div>
                  <span className="text-[10px] text-[#81737c] font-bold uppercase block">
                    Stall Rent
                  </span>
                  <span className="font-extrabold text-[#491546]">
                    ₹{b.stallRent.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                    Advance Paid
                  </span>
                  <span className="font-extrabold text-emerald-700">
                    ₹{b.stallAdvance.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-800 font-bold uppercase block">
                    Remaining
                  </span>
                  <span className="font-extrabold text-amber-700">
                    ₹{b.remainingBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Mode & Action Buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="text-[11px] text-[#81737c] font-medium flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#904277]" />
                  <span>{b.paymentMode}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 rounded-lg bg-[#faf1f5] border border-[#d2c2cc] text-[#491546] hover:bg-[#e9e0e4] active:scale-95 transition-all flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => onDeleteBooking(b.id)}
                    className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 active:scale-95 transition-all flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD / EDIT VENDOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-[#ffffff] rounded-2xl max-w-md w-full max-h-[92vh] flex flex-col border border-[#e9e0e4] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-[#fff7fa] border-b border-[#e9e0e4] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#491546]">
                  {editingBooking ? 'Edit Vendor Details' : `Add New ${series} Series Vendor`}
                </h3>
                <p className="text-xs text-[#81737c]">
                  Stall allocation and rental payment details
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#e9e0e4] text-[#491546] flex items-center justify-center font-bold hover:bg-[#d2c2cc]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form
              onSubmit={handleSubmit}
              className="p-4 overflow-y-auto flex-1 space-y-3 text-xs"
            >
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl text-xs">
                  {formError}
                </div>
              )}

              {/* 1. Exhibitor Name */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[#491546]">
                  Exhibitor Name (e.g. John Doe) *
                </label>
                <input
                  type="text"
                  value={exhibitorName}
                  onChange={(e) => setExhibitorName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-3 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-semibold text-[#1e1a1d] focus:outline-hidden focus:border-[#491546]"
                />
              </div>

              {/* 2. Stall Name */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[#491546]">
                  Stall Name (e.g. Classic Threads) *
                </label>
                <input
                  type="text"
                  value={stallName}
                  onChange={(e) => setStallName(e.target.value)}
                  placeholder="Classic Threads"
                  required
                  className="w-full px-3 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-semibold text-[#1e1a1d] focus:outline-hidden focus:border-[#491546]"
                />
              </div>

              {/* 3. Mobile Number & Stall Number */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[#491546]">
                    Mobile Number (10-Digit) *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    required
                    className="w-full px-3 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-semibold text-[#1e1a1d] focus:outline-hidden focus:border-[#491546]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[#491546]">
                    Stall Number (Unique) *
                  </label>
                  <input
                    type="text"
                    value={stallNumber}
                    onChange={(e) => setStallNumber(e.target.value)}
                    placeholder={`e.g. ${series}-04`}
                    required
                    className="w-full px-3 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-black uppercase text-[#491546] focus:outline-hidden focus:border-[#491546]"
                  />
                </div>
              </div>

              {/* 4. Booking Date & Stall Category */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[#491546]">
                    Booking Date *
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-semibold text-[#1e1a1d] focus:outline-hidden focus:border-[#491546]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[#491546]">
                    Stall Category
                  </label>
                  <select
                    value={stallCategory}
                    onChange={(e) => setStallCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-semibold text-[#1e1a1d] focus:outline-hidden focus:border-[#491546]"
                  >
                    {STALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 5. Stall Rent & Stall Cost Advance */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[#491546]">
                    Stall Rent (Amount) ₹ *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stallRent}
                    onChange={(e) =>
                      setStallRent(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="25000"
                    required
                    className="w-full px-3 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-bold text-[#1e1a1d] focus:outline-hidden focus:border-[#491546]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-emerald-800">
                    Stall Cost Advance (Paid) ₹
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stallAdvance}
                    onChange={(e) =>
                      setStallAdvance(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="15000"
                    className="w-full px-3 py-2.5 bg-[#ffffff] border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* AUTOMATICALLY CALCULATED REMAINING BALANCE & CALCULATED STATUS */}
              <div className="bg-[#faf1f5] border border-[#d2c2cc] rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#81737c] uppercase">
                    Remaining Balance:
                  </span>
                  <span className="font-black text-sm text-[#491546]">
                    ₹{calculatedRemaining.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#81737c] uppercase">
                    Calculated Status:
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full font-black text-xs uppercase ${
                      calculatedStatus === 'Paid'
                        ? 'bg-emerald-200 text-emerald-900'
                        : calculatedStatus === 'Partial'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-rose-200 text-rose-900'
                    }`}
                  >
                    {calculatedStatus}
                  </span>
                </div>
              </div>

              {/* 6. Payment Mode */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[#491546]">
                  Payment Mode *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_MODES.map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        paymentMode === mode
                          ? 'bg-[#491546] text-white border-[#491546]'
                          : 'bg-[#ffffff] text-[#4f434c] border-[#d2c2cc] hover:bg-[#faf1f5]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-4 w-full py-3 bg-gradient-to-r from-[#491546] to-[#632c5e] text-white font-bold text-xs rounded-xl shadow-md active:scale-98 transition-all"
              >
                {editingBooking ? 'Update Vendor Booking' : 'Save Vendor Stall Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
