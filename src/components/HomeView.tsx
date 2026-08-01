import React from 'react';
import { EventItem, VendorBooking } from '../types';
import { calculateEventDashboardStats } from '../lib/storage';
import { Plus, Archive, Calendar, MapPin, Store, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';

interface HomeViewProps {
  events: EventItem[];
  bookings: VendorBooking[];
  onCreateEventClick: () => void;
  onCompletedEventsClick: () => void;
  onSelectEvent: (event: EventItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  events,
  bookings,
  onCreateEventClick,
  onCompletedEventsClick,
  onSelectEvent,
}) => {
  const activeEvents = events.filter((e) => !e.isCompleted);

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Top Logo & Brand Section */}
      <div className="flex flex-col items-center justify-center text-center pt-4 px-2">
        <div className="relative mb-3 group">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#491546] via-[#632c5e] to-[#904277] p-1 shadow-lg shadow-[#491546]/15 flex items-center justify-center">
            <div className="w-full h-full bg-[#fff7fa] rounded-[22px] flex flex-col items-center justify-center p-3">
              <Store className="w-12 h-12 text-[#491546]" />
              <span className="text-[10px] font-extrabold tracking-widest text-[#904277] uppercase mt-1">
                Velvet
              </span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#fea0db] text-[#491546] p-1.5 rounded-full shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-[#491546] tracking-tight">
          The Velvet Trunk
        </h1>
        <p className="text-sm text-[#4f434c] font-normal max-w-[280px] mt-1 leading-snug">
          Your personal concierge for boutique event stall management.
        </p>
      </div>

      {/* Two Key Action Boxes: Create Event & Completed Events */}
      <div className="grid grid-cols-2 gap-3.5 px-1">
        {/* Create Event Box */}
        <button
          onClick={onCreateEventClick}
          className="flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl bg-[#ffffff] border border-[#f4ecef] shadow-sm hover:shadow-md transition-all active:scale-95 text-left group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffd7f5]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-12 h-12 rounded-2xl bg-[#632c5e] text-[#dc97d0] flex items-center justify-center shadow-inner relative z-10 group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div className="text-center relative z-10">
            <span className="block font-bold text-base text-[#491546] leading-tight">
              Create Event
            </span>
            <span className="text-[11px] text-[#81737c] font-medium mt-0.5 block">
              Set up new stalls
            </span>
          </div>
        </button>

        {/* See Completed Previous Events Box */}
        <button
          onClick={onCompletedEventsClick}
          className="flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl bg-[#ffffff] border border-[#f4ecef] shadow-sm hover:shadow-md transition-all active:scale-95 text-left group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffd8ec]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-12 h-12 rounded-2xl bg-[#fea0db] text-[#7c3165] flex items-center justify-center shadow-inner relative z-10 group-hover:scale-105 transition-transform">
            <Archive className="w-6 h-6 text-[#491546] stroke-[2.2]" />
          </div>
          <div className="text-center relative z-10">
            <span className="block font-bold text-base text-[#491546] leading-tight">
              Completed Events
            </span>
            <span className="text-[11px] text-[#81737c] font-medium mt-0.5 block">
              View archives
            </span>
          </div>
        </button>
      </div>

      {/* Current & Upcoming Events Section Box */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#904277] animate-pulse"></div>
            <h2 className="text-lg font-bold text-[#1e1a1d] tracking-tight">
              Current & Upcoming
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#81737c]">
            {activeEvents.length} Active
          </span>
        </div>

        {activeEvents.length === 0 ? (
          <div className="bg-[#ffffff] rounded-2xl p-8 text-center border border-[#e9e0e4] flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#faf1f5] flex items-center justify-center text-[#904277]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-[#491546]">No Active Events</p>
              <p className="text-xs text-[#81737c] mt-1">
                Create a new event to start allocating stalls and managing vendors.
              </p>
            </div>
            <button
              onClick={onCreateEventClick}
              className="mt-2 px-4 py-2 bg-[#491546] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#632c5e] active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Event
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeEvents.map((evt) => {
              const stats = calculateEventDashboardStats(evt, bookings);
              const percentBooked =
                stats.totalStalls > 0
                  ? Math.round((stats.stallsBooked / stats.totalStalls) * 100)
                  : 0;

              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="bg-[#ffffff] rounded-2xl shadow-sm border border-[#e9e0e4] overflow-hidden cursor-pointer hover:shadow-md active:scale-[0.98] transition-all group"
                >
                  {/* Banner Image Preview */}
                  <div className="w-full h-36 bg-[#f4ecef] relative overflow-hidden">
                    <img
                      src={evt.bannerImageUrl || evt.layoutImageUrl}
                      alt={evt.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                    {/* Status badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#ffffff]/90 backdrop-blur-md rounded-full flex items-center gap-1.5 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] uppercase font-bold text-[#491546] tracking-wider">
                        ACTIVE EVENT
                      </span>
                    </div>

                    {/* Date Tag */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                        <Calendar className="w-3.5 h-3.5 text-[#fea0db]" />
                        <span>
                          {evt.startDate} to {evt.endDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-[#1e1a1d] line-clamp-1 group-hover:text-[#491546] transition-colors">
                          {evt.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-[#4f434c] mt-0.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#904277]" />
                          <span className="line-clamp-1">{evt.location}</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#faf1f5] flex items-center justify-center text-[#491546] group-hover:bg-[#491546] group-hover:text-white transition-colors shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Series summary pills */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#f4ecef]">
                      <div className="bg-[#faf1f5] p-2 rounded-xl flex items-center justify-between">
                        <span className="text-[#81737c] font-medium">F Series:</span>
                        <span className="font-bold text-[#491546]">
                          {stats.fBooked} / {stats.fLimit}
                        </span>
                      </div>
                      <div className="bg-[#faf1f5] p-2 rounded-xl flex items-center justify-between">
                        <span className="text-[#81737c] font-medium">S Series:</span>
                        <span className="font-bold text-[#904277]">
                          {stats.sBooked} / {stats.sLimit}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#81737c] font-semibold uppercase tracking-wider">
                          Stalls Occupancy
                        </span>
                        <span className="text-[#491546] font-bold">
                          {percentBooked}% ({stats.stallsBooked}/{stats.totalStalls})
                        </span>
                      </div>
                      <div className="w-full bg-[#e9e0e4] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#491546] to-[#904277] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, percentBooked)}%` }}
                        ></div>
                      </div>
                    </div>
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
