import React, { useState } from 'react';
import { EventItem } from '../types';
import { DEFAULT_LAYOUT_IMAGE } from '../lib/storage';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Layers,
  Upload,
  Image as ImageIcon,
  Check,
  Building,
  Sparkles,
} from 'lucide-react';

interface CreateEventViewProps {
  initialEvent?: EventItem | null;
  onSave: (eventData: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => void;
  onBack: () => void;
}

export const CreateEventView: React.FC<CreateEventViewProps> = ({
  initialEvent,
  onSave,
  onBack,
}) => {
  const [name, setName] = useState(initialEvent?.name || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [startDate, setStartDate] = useState(initialEvent?.startDate || '2026-08-15');
  const [endDate, setEndDate] = useState(initialEvent?.endDate || '2026-08-17');
  const [timing, setTiming] = useState(initialEvent?.timing || '10:00 AM - 09:00 PM');
  const [mapLocation, setMapLocation] = useState(initialEvent?.mapLocation || '');

  // Two Boxes for Stall Limits: F Series & S Series
  const [fSeriesLimit, setFSeriesLimit] = useState<number>(
    initialEvent?.fSeriesLimit ?? 100
  );
  const [sSeriesLimit, setSSeriesLimit] = useState<number>(
    initialEvent?.sSeriesLimit ?? 20
  );

  // JPG Layout Image
  const [layoutImageUrl, setLayoutImageUrl] = useState<string>(
    initialEvent?.layoutImageUrl || DEFAULT_LAYOUT_IMAGE
  );
  const [imageFileName, setImageFileName] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('image')) {
        setErrorMsg('Please upload a valid JPG or PNG image file.');
        return;
      }
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setLayoutImageUrl(uploadEvent.target.result as string);
          setErrorMsg('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter the Event Name.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Please enter the Location.');
      return;
    }

    onSave(
      {
        name,
        location,
        startDate,
        endDate,
        timing,
        mapLocation,
        fSeriesLimit: Number(fSeriesLimit) || 100,
        sSeriesLimit: Number(sSeriesLimit) || 20,
        layoutImageUrl: layoutImageUrl || DEFAULT_LAYOUT_IMAGE,
        bannerImageUrl: layoutImageUrl || DEFAULT_LAYOUT_IMAGE,
        isCompleted: initialEvent?.isCompleted || false,
      },
      initialEvent?.id
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-md mx-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#e9e0e4] flex items-center justify-center text-[#491546] shadow-xs active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#491546]">
            {initialEvent ? 'Edit Event Details' : 'Create New Event'}
          </h1>
          <p className="text-xs text-[#81737c]">
            Define layout, timings, map & stall limits
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* 1. Event Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#904277]" /> Event Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Royal Velvet Diwali Trunk Show"
            required
            className="w-full px-4 py-3 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-sm font-medium text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] focus:ring-1 focus:ring-[#491546] shadow-2xs"
          />
        </div>

        {/* 2. Location */}
          <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#904277]" /> Location Name *
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Grand Starlight Ballroom, Bandra West"
            required
            className="w-full px-4 py-3 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-sm font-medium text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] focus:ring-1 focus:ring-[#491546] shadow-2xs"
          />
        </div>

        {/* 3. Dates & Timings */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#904277]" /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-medium text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] shadow-2xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#904277]" /> End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-medium text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] shadow-2xs"
            />
          </div>
        </div>

        {/* Timing */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#904277]" /> Exhibition Timing
          </label>
          <input
            type="text"
            value={timing}
            onChange={(e) => setTiming(e.target.value)}
            placeholder="e.g. 10:00 AM - 09:00 PM"
            className="w-full px-4 py-3 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-sm font-medium text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] shadow-2xs"
          />
        </div>

        {/* Map Location Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#904277]" /> Map Location (Google Maps Link)
          </label>
          <input
            type="text"
            value={mapLocation}
            onChange={(e) => setMapLocation(e.target.value)}
            placeholder="e.g. https://maps.google.com/?q=Hotel+Taj+Ballroom"
            className="w-full px-4 py-3 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-medium text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] shadow-2xs"
          />
        </div>

        {/* TWO BOXES FOR STALL LIMITS: F SERIES AND S SERIES */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#904277]" /> Stall Capacity Limits
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Box 1: F Series Box */}
            <div className="p-4 rounded-2xl bg-[#ffffff] border-2 border-[#632c5e]/30 shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-[#632c5e] text-white text-[11px] font-extrabold uppercase">
                  F SERIES
                </span>
                <span className="text-[10px] text-[#81737c] font-medium">Standard</span>
              </div>
              <p className="text-xs text-[#4f434c] leading-tight">
                Front Pavilion Stall Limit
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={fSeriesLimit}
                  onChange={(e) => setFSeriesLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#faf1f5] border border-[#d2c2cc] rounded-xl text-center font-extrabold text-base text-[#491546] focus:outline-hidden focus:border-[#491546]"
                />
                <span className="text-xs font-bold text-[#81737c]">Stalls</span>
              </div>
              <p className="text-[10px] text-[#81737c] italic text-center">
                Default: 100 stalls
              </p>
            </div>

            {/* Box 2: S Series Box */}
            <div className="p-4 rounded-2xl bg-[#ffffff] border-2 border-[#904277]/30 shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-[#fea0db] text-[#491546] text-[11px] font-extrabold uppercase">
                  S SERIES
                </span>
                <span className="text-[10px] text-[#904277] font-medium">VIP Select</span>
              </div>
              <p className="text-xs text-[#4f434c] leading-tight">
                Premium VIP Stall Limit
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={sSeriesLimit}
                  onChange={(e) => setSSeriesLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#faf1f5] border border-[#d2c2cc] rounded-xl text-center font-extrabold text-base text-[#491546] focus:outline-hidden focus:border-[#491546]"
                />
                <span className="text-xs font-bold text-[#81737c]">Stalls</span>
              </div>
              <p className="text-[10px] text-[#81737c] italic text-center">
                Default: 20 stalls
              </p>
            </div>
          </div>
        </div>

        {/* Upload Layout JPG Image */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#904277]" /> Upload Layout Plan (JPG Format)
          </label>

          <div className="border-2 border-dashed border-[#d2c2cc] bg-[#ffffff] rounded-2xl p-4 text-center hover:border-[#491546] transition-colors flex flex-col items-center gap-2">
            {layoutImageUrl ? (
              <div className="w-full flex flex-col items-center gap-2">
                <div className="w-full h-40 rounded-xl overflow-hidden bg-[#faf1f5] border border-[#e9e0e4] relative group">
                  <img
                    src={layoutImageUrl}
                    alt="Layout Preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    Click below to replace image
                  </div>
                </div>
                {imageFileName && (
                  <span className="text-xs text-[#81737c] font-medium">
                    Uploaded: {imageFileName}
                  </span>
                )}
              </div>
            ) : (
              <div className="py-4 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#faf1f5] text-[#491546] flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-[#491546]">
                  Click to select JPG / PNG layout plan
                </p>
                <p className="text-[11px] text-[#81737c]">
                  Upload architectural layout JPG showing F and S stall zones
                </p>
              </div>
            )}

            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#faf1f5] text-[#491546] text-xs font-bold rounded-xl border border-[#d2c2cc] hover:bg-[#e9e0e4] active:scale-95 transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>{layoutImageUrl ? 'Change Layout JPG' : 'Upload Layout Image'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 w-full py-3.5 px-6 bg-gradient-to-r from-[#491546] to-[#632c5e] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>{initialEvent ? 'Save Event Changes' : 'Create & Launch Event'}</span>
        </button>
      </form>
    </div>
  );
};
