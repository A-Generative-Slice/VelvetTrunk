import React from 'react';
import { EventItem, VendorBooking } from '../types';
import { calculateEventDashboardStats, formatDateRange } from '../lib/storage';
import { Plus, Archive, Calendar, MapPin, Store, Sparkles, ChevronRight } from 'lucide-react';

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
    <div className="flex flex-col gap-6 pb-12">
      {/* Simple Clean Logo & Text Box (No repeated buttons) */}
      <div className="bg-gradient-to-r from-[#491546] via-[#632c5e] to-[#904277] rounded-3xl p-6 text-white shadow-lg shadow-[#491546]/10 relative overflow-hidden flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none"></div>

        <div className="w-20 h-20 rounded-2xl bg-[#ffffff] p-1.5 shadow-lg border border-white/20 shrink-0 flex items-center justify-center overflow-hidden">
          <img
            src="agenerativeslicelogo.jpg"
            alt="A Generative Slice Logo"
            className="w-full h-full object-contain rounded-xl"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <div className="z-10">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              The Velvet Trunk
            </h1>
            <Sparkles className="w-4 h-4 text-[#fea0db]" />
          </div>
          <p className="text-xs sm:text-sm text-[#ffd7f5] font-medium mt-1 leading-relaxed">
            Boutique Event Management, Stall Allocations & Financial Concierge.
          </p>
        </div>
      </div>

      {/* Main Action Cards (Rendered Once, No Duplicates) */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onCreateEventClick}
          className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-[#ffffff] border border-[#f4ecef] shadow-xs hover:shadow-md transition-all active:scale-95 text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#632c5e] text-[#dc97d0] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div>
            <span className="block font-bold text-base text-[#491546]">
              Create Event
            </span>
            <span className="text-xs text-[#81737c] font-medium mt-0.5 block">
              Set up new stalls
            </span>
          </div>
        </button>

        <button
          onClick={onCompletedEventsClick}
          className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-[#ffffff] border border-[#f4ecef] shadow-xs hover:shadow-md transition-all active:scale-95 text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#fea0db] text-[#7c3165] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <Archive className="w-6 h-6 text-[#491546] stroke-[2.2]" />
          </div>
          <div>
            <span className="block font-bold text-base text-[#491546]">
              Completed Events
            </span>
            <span className="text-xs text-[#81737c] font-medium mt-0.5 block">
              View archives
            </span>
          </div>
        </button>
      </div>

      {/* Current & Upcoming Events Section */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-[#904277] animate-pulse"></div>
            <h2 className="text-xl font-extrabold text-[#1e1a1d] tracking-tight">
              Active Exhibitions
            </h2>
          </div>
          <span className="px-3 py-1 bg-[#f4ecef] text-[#491546] text-xs font-bold rounded-full border border-[#e9e0e4]">
            {activeEvents.length} Active
          </span>
        </div>

        {activeEvents.length === 0 ? (
          <div className="bg-[#ffffff] rounded-3xl p-10 text-center border border-[#e9e0e4] flex flex-col items-center gap-4 shadow-xs max-w-xl mx-auto w-full my-2">
            <div className="w-16 h-16 rounded-2xl bg-[#faf1f5] flex items-center justify-center text-[#904277]">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#491546]">No Active Exhibitions</h3>
              <p className="text-xs sm:text-sm text-[#81737c] mt-1 max-w-sm">
                Get started by creating your first exhibition event to manage F & S series stall allocations and vendor bookings.
              </p>
            </div>
            <button
              onClick={onCreateEventClick}
              className="mt-2 px-6 py-3 bg-[#491546] text-white text-sm font-bold rounded-xl shadow-md hover:bg-[#632c5e] active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" /> Create New Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="bg-[#ffffff] rounded-2xl shadow-xs border border-[#e9e0e4] overflow-hidden cursor-pointer hover:shadow-xl hover:border-[#d2c2cc] active:scale-[0.99] transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Banner Image Preview */}
                    <div className="w-full h-44 bg-[#f4ecef] relative overflow-hidden">
                      <img
                        src={evt.bannerImageUrl || evt.layoutImageUrl}
                        alt={evt.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                      {/* Status badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full flex items-center gap-1.5 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] uppercase font-extrabold text-[#491546] tracking-wider">
                          ACTIVE EVENT
                        </span>
                      </div>

                      {/* Date Tag */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/95">
                          <Calendar className="w-3.5 h-3.5 text-[#fea0db]" />
                          <span>
                            {formatDateRange(evt.startDate, evt.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-5 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-extrabold text-lg text-[#1e1a1d] line-clamp-1 group-hover:text-[#491546] transition-colors">
                            {evt.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[#4f434c] mt-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#904277]" />
                            <span className="line-clamp-1">{evt.location}</span>
                          </div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-[#faf1f5] flex items-center justify-center text-[#491546] group-hover:bg-[#491546] group-hover:text-white transition-colors shrink-0">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Series summary pills */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#f4ecef]">
                        <div className="bg-[#faf1f5] p-2.5 rounded-xl flex items-center justify-between">
                          <span className="text-[#81737c] font-semibold">F-Series:</span>
                          <span className="font-extrabold text-[#491546]">
                            {stats.fBooked} / {stats.fLimit}
                          </span>
                        </div>
                        <div className="bg-[#faf1f5] p-2.5 rounded-xl flex items-center justify-between">
                          <span className="text-[#81737c] font-semibold">S-Series:</span>
                          <span className="font-extrabold text-[#904277]">
                            {stats.sBooked} / {stats.sLimit}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#81737c] font-semibold uppercase tracking-wider">
                            Stalls Occupancy
                          </span>
                          <span className="text-[#491546] font-extrabold">
                            {percentBooked}% ({stats.stallsBooked}/{stats.totalStalls})
                          </span>
                        </div>
                        <div className="w-full bg-[#e9e0e4] rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#491546] to-[#904277] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, percentBooked)}%` }}
                          ></div>
                        </div>
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
