import React, { useState } from 'react';
import { EventItem, VendorBooking } from '../types';
import { calculateEventDashboardStats } from '../lib/storage';
import { generateEventSummaryPDF } from '../lib/pdfGenerator';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Edit,
  Trash2,
  ExternalLink,
  Layers,
  DollarSign,
  TrendingUp,
  Clock3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Maximize2,
  X,
  RotateCcw,
  Sparkles,
  FileText,
  Download,
  Printer,
} from 'lucide-react';

interface EventDetailsViewProps {
  event: EventItem;
  bookings: VendorBooking[];
  onOpenFSeries: () => void;
  onOpenSSeries: () => void;
  onEditEvent: () => void;
  onDeleteEvent: () => void;
  onToggleComplete: () => void;
  onBack: () => void;
}

export const EventDetailsView: React.FC<EventDetailsViewProps> = ({
  event,
  bookings,
  onOpenFSeries,
  onOpenSSeries,
  onEditEvent,
  onDeleteEvent,
  onToggleComplete,
  onBack,
}) => {
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

  const stats = calculateEventDashboardStats(event, bookings);

  const handleExportPDF = () => {
    try {
      setIsExportingPdf(true);
      generateEventSummaryPDF(event, bookings);
      setExportSuccessMsg('PDF Summary generated and downloaded successfully!');
      setTimeout(() => setExportSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Could not generate PDF summary. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full max-w-6xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#e9e0e4] flex items-center justify-center text-[#491546] shadow-xs active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="p-2.5 rounded-xl bg-[#491546] text-white hover:bg-[#632c5e] active:scale-95 transition-all flex items-center gap-1.5 text-xs font-extrabold shadow-xs"
            title="Export Simplified PDF Summary"
          >
            <Download className="w-4 h-4 text-[#fea0db]" />
            <span>{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
          </button>
          <button
            onClick={onEditEvent}
            className="p-2.5 rounded-xl bg-[#ffffff] border border-[#d2c2cc] text-[#491546] hover:bg-[#faf1f5] active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Edit Event Details"
          >
            <Edit className="w-4 h-4 text-[#904277]" /> Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Delete Event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {exportSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportSuccessMsg}</span>
        </div>
      )}

      {/* Event Header Banner Card */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#e9e0e4] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              event.isCompleted
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-[#fea0db] text-[#491546]'
            }`}
          >
            {event.isCompleted ? 'COMPLETED EVENT' : 'ACTIVE EXHIBITION'}
          </span>

          <button
            onClick={onToggleComplete}
            className="text-xs font-bold text-[#904277] hover:text-[#491546] underline flex items-center gap-1"
          >
            {event.isCompleted ? 'Mark as Active' : 'Mark Completed'}
          </button>
        </div>

        <div>
          <h1 className="text-xl font-extrabold text-[#491546] leading-tight">
            {event.name}
          </h1>
          <p className="text-xs text-[#4f434c] flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#904277] shrink-0" />
            <span>{event.location}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#f4ecef] text-[#81737c]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#904277]" />
            <span className="font-semibold text-[#1e1a1d]">
              {event.startDate} - {event.endDate}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#904277]" />
            <span className="font-semibold text-[#1e1a1d]">{event.timing}</span>
          </div>
        </div>

        {event.mapLocation && (
          <a
            href={event.mapLocation}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#491546] hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#904277]" /> Open Location Map
          </a>
        )}

        {/* Quick PDF Summary Action Button */}
        <button
          onClick={handleExportPDF}
          disabled={isExportingPdf}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#491546] to-[#632c5e] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-md active:scale-98 transition-all"
        >
          <FileText className="w-4 h-4 text-[#fea0db]" />
          <span>
            {isExportingPdf
              ? 'Generating PDF Summary...'
              : 'Export PDF Summary (Bookings & Financial Totals)'}
          </span>
        </button>
      </div>

      {/* TWO BOXES AT TOP: F SERIES AND S SERIES */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#491546] px-1 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#904277]" /> Manage Stall Series
        </h2>

        <div className="grid grid-cols-2 gap-3.5">
          {/* F Series Box */}
          <button
            onClick={onOpenFSeries}
            className="flex flex-col gap-2 p-4 rounded-2xl bg-gradient-to-br from-[#491546] to-[#632c5e] text-white shadow-md hover:shadow-lg active:scale-95 transition-all text-left relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-[#dc97d0] text-[#491546] text-[10px] font-extrabold uppercase">
                F SERIES
              </span>
              <span className="text-[10px] text-[#f7b0eb] font-bold">Front Pavilion</span>
            </div>

            <div>
              <span className="text-xl font-extrabold block text-white">
                {stats.fBooked}{' '}
                <span className="text-xs font-normal text-[#f7b0eb]">
                  / {stats.fLimit} Booked
                </span>
              </span>
              <span className="text-[11px] text-[#dc97d0] font-medium mt-0.5 block">
                Manage F Vendors →
              </span>
            </div>
          </button>

          {/* S Series Box */}
          <button
            onClick={onOpenSSeries}
            className="flex flex-col gap-2 p-4 rounded-2xl bg-gradient-to-br from-[#904277] to-[#7c3165] text-white shadow-md hover:shadow-lg active:scale-95 transition-all text-left relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-[#fea0db] text-[#491546] text-[10px] font-extrabold uppercase">
                S SERIES
              </span>
              <span className="text-[10px] text-[#ffd8ec] font-bold">VIP Select</span>
            </div>

            <div>
              <span className="text-xl font-extrabold block text-white">
                {stats.sBooked}{' '}
                <span className="text-xs font-normal text-[#ffd8ec]">
                  / {stats.sLimit} Booked
                </span>
              </span>
              <span className="text-[11px] text-[#fea0db] font-medium mt-0.5 block">
                Manage S Vendors →
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* DASHBOARD LIKE THINGS */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#e9e0e4] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-[#491546] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#904277]" /> Exhibition Dashboard
          </h2>
          <span className="text-xs font-bold text-[#81737c]">
            {stats.stallsBooked} / {stats.totalStalls} Stalls Occupied
          </span>
        </div>

        {/* 1. Stall Occupancy Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-[#faf1f5] p-3 rounded-xl border border-[#e9e0e4] text-center">
            <span className="text-[10px] text-[#81737c] font-bold uppercase block">
              Total Stall
            </span>
            <span className="text-base font-extrabold text-[#491546]">
              {stats.totalStalls}
            </span>
          </div>

          <div className="bg-[#faf1f5] p-3 rounded-xl border border-[#e9e0e4] text-center">
            <span className="text-[10px] text-[#81737c] font-bold uppercase block">
              Stalls Booked
            </span>
            <span className="text-base font-extrabold text-[#904277]">
              {stats.stallsBooked}
            </span>
          </div>

          <div className="bg-[#faf1f5] p-3 rounded-xl border border-[#e9e0e4] text-center">
            <span className="text-[10px] text-[#81737c] font-bold uppercase block">
              Stalls Available
            </span>
            <span className="text-base font-extrabold text-emerald-700">
              {stats.stallsAvailable}
            </span>
          </div>
        </div>

        {/* 2. Financial Metrics Grid */}
        <div className="space-y-2 pt-2 border-t border-[#f4ecef]">
          <span className="text-xs font-bold uppercase text-[#81737c] tracking-wider block">
            Financial Rent Summary
          </span>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#ffffff] p-3 rounded-xl border border-[#d2c2cc] text-center shadow-2xs">
              <span className="text-[10px] text-[#81737c] font-bold uppercase block">
                Total Value
              </span>
              <span className="text-xs font-black text-[#491546] block truncate">
                ₹{stats.totalValue.toLocaleString()}
              </span>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center shadow-2xs">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                Collected
              </span>
              <span className="text-xs font-black text-emerald-700 block truncate">
                ₹{stats.totalCollected.toLocaleString()}
              </span>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center shadow-2xs">
              <span className="text-[10px] text-amber-800 font-bold uppercase block">
                Pending Amount
              </span>
              <span className="text-xs font-black text-amber-700 block truncate">
                ₹{stats.totalPending.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Collection Status (Paid, Partial, Unpaid) */}
        <div className="space-y-2 pt-2 border-t border-[#f4ecef]">
          <span className="text-xs font-bold uppercase text-[#81737c] tracking-wider block">
            Collection Status Breakdown
          </span>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {/* Paid Box */}
            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1 text-emerald-800 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Paid
              </div>
              <span className="text-base font-extrabold text-emerald-900">
                {stats.paidCount}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">Fully Paid</span>
            </div>

            {/* Partial Box */}
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1 text-amber-800 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Partial
              </div>
              <span className="text-base font-extrabold text-amber-900">
                {stats.partialCount}
              </span>
              <span className="text-[10px] text-amber-700 font-medium">
                Advance Paid
              </span>
            </div>

            {/* Unpaid Box */}
            <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1 text-rose-800 font-bold">
                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Unpaid
              </div>
              <span className="text-base font-extrabold text-rose-900">
                {stats.unpaidCount}
              </span>
              <span className="text-[10px] text-rose-700 font-medium">Due Rent</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW THE LAYOUT JPG IMAGE */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#e9e0e4] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-[#491546] uppercase tracking-wider flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-[#904277]" /> Event Layout Map (JPG)
          </h2>
          <button
            onClick={() => setIsLayoutModalOpen(true)}
            className="text-xs font-bold text-[#491546] hover:underline flex items-center gap-1"
          >
            <Maximize2 className="w-3.5 h-3.5" /> Fullscreen View
          </button>
        </div>

        <div
          onClick={() => setIsLayoutModalOpen(true)}
          className="w-full h-52 bg-[#faf1f5] rounded-xl overflow-hidden border border-[#d2c2cc] relative cursor-pointer group"
        >
          <img
            src={event.layoutImageUrl}
            alt="Event Layout JPG"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
            <Maximize2 className="w-4 h-4" /> Click to enlarge layout
          </div>
        </div>
      </div>

      {/* FULLSCREEN LAYOUT MODAL */}
      {isLayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#fff7fa] rounded-2xl max-w-lg w-full p-4 max-h-[90vh] flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#e9e0e4] pb-2">
              <h3 className="font-bold text-sm text-[#491546]">
                {event.name} - Floor Plan Layout
              </h3>
              <button
                onClick={() => setIsLayoutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#e9e0e4] text-[#491546] flex items-center justify-center font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-[#faf1f5] rounded-xl p-2 min-h-[300px] flex items-center justify-center">
              <img
                src={event.layoutImageUrl}
                alt="Event Layout Full"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            <button
              onClick={() => setIsLayoutModalOpen(false)}
              className="w-full py-2.5 bg-[#491546] text-white text-xs font-bold rounded-xl"
            >
              Close Floor Plan
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl p-6 max-w-sm w-full space-y-4 border border-[#e9e0e4] shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-[#1e1a1d]">Delete Event?</h3>
              <p className="text-xs text-[#81737c] mt-1">
                Are you sure you want to delete "{event.name}" and all associated stall bookings? This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2.5 px-4 bg-[#faf1f5] text-[#491546] text-xs font-bold rounded-xl border border-[#d2c2cc]"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteEvent}
                className="py-2.5 px-4 bg-red-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-red-700"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
