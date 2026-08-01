import React, { useState } from 'react';
import { EventItem, VendorBooking } from '../types';
import { calculateEventDashboardStats } from '../lib/storage';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  TrendingUp,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface CompletedEventsViewProps {
  events: EventItem[];
  bookings: VendorBooking[];
  onSelectEvent: (event: EventItem) => void;
  onReopenEvent: (event: EventItem) => void;
  onBack: () => void;
}

export const CompletedEventsView: React.FC<CompletedEventsViewProps> = ({
  events,
  bookings,
  onSelectEvent,
  onReopenEvent,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const completedEvents = events.filter((e) => e.isCompleted);

  const filteredEvents = completedEvents.filter((evt) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      evt.name.toLowerCase().includes(q) ||
      evt.location.toLowerCase().includes(q) ||
      evt.startDate.includes(q) ||
      evt.endDate.includes(q)
    );
  });

  // Total completed revenue across all completed events
  let totalCompletedRevenue = 0;

  completedEvents.forEach((evt) => {
    const stats = calculateEventDashboardStats(evt, bookings);
    totalCompletedRevenue += stats.totalCollected;
  });

  return (
    <div className="flex flex-col gap-6 pb-12 w-full">
      {/* Top Navigation */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#e9e0e4] flex items-center justify-center text-[#491546] shadow-xs active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#491546] flex items-center gap-2">
            Completed Events <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </h1>
          <p className="text-xs text-[#81737c]">
            Archive of all previous exhibitions & stall logs
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e9e0e4] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#faf1f5] text-[#491546] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#81737c] font-bold uppercase tracking-wider block">
              Previous Events
            </span>
            <span className="text-lg font-extrabold text-[#491546]">
              {completedEvents.length}
            </span>
          </div>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e9e0e4] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fea0db]/20 text-[#7c3165] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#81737c] font-bold uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="text-lg font-extrabold text-[#491546]">
              ₹{totalCompletedRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="search-archive-input" className="text-xs font-bold uppercase tracking-wider text-[#491546] px-1">
          Search Archive
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-[#81737c] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-archive-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event name, venue or date..."
            className="w-full pl-10 pr-4 py-3 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-medium text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#81737c] hover:text-[#491546]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#81737c] px-1">
          Archived Events ({filteredEvents.length})
        </span>

        {filteredEvents.length === 0 ? (
          <div className="bg-[#ffffff] p-8 text-center rounded-2xl border border-[#e9e0e4] text-[#81737c]">
            <p className="font-bold text-sm text-[#491546]">No Completed Events Found</p>
            <p className="text-xs mt-1">
              {searchQuery
                ? `No events matching "${searchQuery}"`
                : 'When an event finishes, mark it as completed to move it to this archive.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const stats = calculateEventDashboardStats(evt, bookings);

              return (
                <div
                  key={evt.id}
                  className="bg-[#ffffff] rounded-2xl border border-[#e9e0e4] p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col gap-3"
                >
                  <div
                    onClick={() => onSelectEvent(evt)}
                    className="cursor-pointer flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                          COMPLETED
                        </span>
                        <span className="text-[11px] text-[#81737c] font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#904277]" /> {evt.startDate}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-[#491546] hover:underline">
                        {evt.name}
                      </h3>
                      <p className="text-xs text-[#4f434c] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#904277] shrink-0" />
                        <span className="line-clamp-1">{evt.location}</span>
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[#faf1f5] flex items-center justify-center text-[#491546] shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Metrics Breakdown */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#f4ecef] text-center bg-[#faf1f5]/60 p-2.5 rounded-xl">
                    <div>
                      <span className="text-[10px] text-[#81737c] font-bold uppercase block">
                        Stalls Booked
                      </span>
                      <span className="text-xs font-extrabold text-[#491546]">
                        {stats.stallsBooked} / {stats.totalStalls}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#81737c] font-bold uppercase block">
                        Collection
                      </span>
                      <span className="text-xs font-extrabold text-emerald-700">
                        ₹{stats.totalCollected.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#81737c] font-bold uppercase block">
                        Pending
                      </span>
                      <span className="text-xs font-extrabold text-amber-700">
                        ₹{stats.totalPending.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onSelectEvent(evt)}
                      className="text-xs font-bold text-[#491546] hover:text-[#632c5e] flex items-center gap-1"
                    >
                      View Vendor Logs & Layout →
                    </button>

                    <button
                      onClick={() => onReopenEvent(evt)}
                      className="text-[11px] font-bold text-[#904277] hover:text-[#491546] flex items-center gap-1 px-2.5 py-1 bg-[#faf1f5] rounded-lg border border-[#d2c2cc] active:scale-95 transition-all"
                    >
                      <RotateCcw className="w-3 h-3" /> Reactivate Event
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
