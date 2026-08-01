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
} from 'lucide-react';

interface CreateEventViewProps {
  initialEvent?: EventItem | null;
  onSave: (eventData: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => void;
  onBack: () => void;
}

function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mStr = m.toString().padStart(2, '0');
  return `${h12.toString().padStart(2, '0')}:${mStr} ${period}`;
}

export const CreateEventView: React.FC<CreateEventViewProps> = ({
  initialEvent,
  onSave,
  onBack,
}) => {
  const [name, setName] = useState(initialEvent?.name || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [startDate, setStartDate] = useState(initialEvent?.startDate || '');
  const [endDate, setEndDate] = useState(initialEvent?.endDate || '');

  // Time pickers for Opening and Closing timing
  const [startTime, setStartTime] = useState(initialEvent?.timing ? '10:00' : '');
  const [endTime, setEndTime] = useState(initialEvent?.timing ? '21:00' : '');

  const [mapLocation, setMapLocation] = useState(initialEvent?.mapLocation || '');

  // Stall Limits: F Series & S Series (supports empty string state for smooth backspacing)
  const [fSeriesLimit, setFSeriesLimit] = useState<number | ''>(
    initialEvent?.fSeriesLimit ?? 100
  );
  const [sSeriesLimit, setSSeriesLimit] = useState<number | ''>(
    initialEvent?.sSeriesLimit ?? 20
  );

  // Layout Image
  const [layoutImageUrl, setLayoutImageUrl] = useState<string>(
    initialEvent?.layoutImageUrl || DEFAULT_LAYOUT_IMAGE
  );
  const [imageFileName, setImageFileName] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('image')) {
        setErrorMsg('Please select a valid image file (PNG, JPG, SVG, WebP).');
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

    // Format combined timing string if times selected
    let timingString = '';
    if (startTime && endTime) {
      timingString = `${formatTime12h(startTime)} - ${formatTime12h(endTime)}`;
    } else if (startTime) {
      timingString = `From ${formatTime12h(startTime)}`;
    }

    onSave(
      {
        name: name.trim(),
        location: location.trim(),
        startDate,
        endDate,
        timing: timingString,
        mapLocation: mapLocation.trim(),
        fSeriesLimit: fSeriesLimit === '' ? 100 : Number(fSeriesLimit) || 100,
        sSeriesLimit: sSeriesLimit === '' ? 20 : Number(sSeriesLimit) || 20,
        layoutImageUrl: layoutImageUrl || DEFAULT_LAYOUT_IMAGE,
        bannerImageUrl: layoutImageUrl || DEFAULT_LAYOUT_IMAGE,
        isCompleted: initialEvent?.isCompleted || false,
      },
      initialEvent?.id
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-3xl mx-auto w-full">
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
          <label htmlFor="event-name-input" className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#904277]" /> Event Name *
          </label>
          <input
            id="event-name-input"
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
          <label htmlFor="location-name-input" className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#904277]" /> Location Name *
          </label>
          <input
            id="location-name-input"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Grand Starlight Ballroom, Bandra West"
            required
            className="w-full px-4 py-3 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-sm font-medium text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] focus:ring-1 focus:ring-[#491546] shadow-2xs"
          />
        </div>

        {/* 3. Dates & Timings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="start-date-input" className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#904277]" /> Start Date
            </label>
            <input
              id="start-date-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-medium text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] shadow-2xs cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="end-date-input" className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#904277]" /> End Date
            </label>
            <input
              id="end-date-input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-medium text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] shadow-2xs cursor-pointer"
            />
          </div>
        </div>

        {/* Exhibition Timing with Clock Pop-up Time Pickers */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#904277]" /> Exhibition Timing
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#81737c] uppercase block">Opening Time</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-semibold text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] cursor-pointer shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#81737c] uppercase block">Closing Time</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-semibold text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] cursor-pointer shadow-2xs"
              />
            </div>
          </div>
          {startTime && endTime && (
            <p className="text-[11px] font-bold text-[#491546] pt-1">
              Selected Timing: <span className="text-[#904277]">{formatTime12h(startTime)} - {formatTime12h(endTime)}</span>
            </p>
          )}
        </div>

        {/* Map Location Link */}
        <div className="space-y-1.5">
          <label htmlFor="map-location-input" className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#904277]" /> Map Location (Google Maps Link)
          </label>
          <input
            id="map-location-input"
            type="text"
            value={mapLocation}
            onChange={(e) => setMapLocation(e.target.value)}
            placeholder="e.g. https://maps.google.com/?q=Hotel+Taj+Ballroom"
            className="w-full px-4 py-3 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-medium text-[#1e1a1d] focus:outline-hidden focus:border-[#491546] shadow-2xs"
          />
        </div>

        {/* CLEAN STALL CAPACITY LIMITS: F SERIES AND S SERIES */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#904277]" /> Stall Capacity Limits
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Box 1: F Series Box */}
            <div className="p-4 rounded-2xl bg-[#ffffff] border-2 border-[#632c5e]/30 shadow-xs flex flex-col gap-2.5 items-center text-center">
              <span className="px-3 py-1 rounded-lg bg-[#632c5e] text-white text-xs font-extrabold uppercase tracking-wider">
                F SERIES
              </span>
              <div className="w-full mt-1">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={fSeriesLimit}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setFSeriesLimit('');
                    } else {
                      const parsed = parseInt(val, 10);
                      setFSeriesLimit(isNaN(parsed) ? '' : parsed);
                    }
                  }}
                  placeholder="100"
                  className="w-full px-3 py-2.5 bg-[#faf1f5] border border-[#d2c2cc] rounded-xl text-center font-extrabold text-lg text-[#491546] focus:outline-hidden focus:border-[#491546]"
                />
              </div>
            </div>

            {/* Box 2: S Series Box */}
            <div className="p-4 rounded-2xl bg-[#ffffff] border-2 border-[#904277]/30 shadow-xs flex flex-col gap-2.5 items-center text-center">
              <span className="px-3 py-1 rounded-lg bg-[#fea0db] text-[#491546] text-xs font-extrabold uppercase tracking-wider">
                S SERIES
              </span>
              <div className="w-full mt-1">
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={sSeriesLimit}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setSSeriesLimit('');
                    } else {
                      const parsed = parseInt(val, 10);
                      setSSeriesLimit(isNaN(parsed) ? '' : parsed);
                    }
                  }}
                  placeholder="20"
                  className="w-full px-3 py-2.5 bg-[#faf1f5] border border-[#d2c2cc] rounded-xl text-center font-extrabold text-lg text-[#491546] focus:outline-hidden focus:border-[#491546]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sleek Layout Plan Upload Dropzone (No JPG mention, Better UI) */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#491546] flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#904277]" /> Exhibition Layout Plan
          </label>

          <div className="p-5 rounded-2xl bg-[#ffffff] border-2 border-dashed border-[#d2c2cc] hover:border-[#491546] transition-all space-y-4 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-[#faf1f5] text-[#491546] flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <label className="px-5 py-2.5 bg-[#491546] hover:bg-[#632c5e] text-white text-xs font-bold rounded-xl cursor-pointer shadow-md active:scale-95 transition-all inline-flex items-center gap-2">
                  <span>Upload Layout Plan</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[11px] text-[#81737c] font-medium mt-1">
                {imageFileName ? `Selected File: ${imageFileName}` : 'Select a custom layout image or use default floor plan'}
              </p>
            </div>

            {/* Layout Image Preview */}
            <div className="w-full h-48 bg-[#f4ecef] rounded-xl border border-[#e9e0e4] overflow-hidden relative flex items-center justify-center">
              <img
                src={layoutImageUrl}
                alt="Layout Plan Preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 right-2 px-3 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white text-[10px] font-bold">
                Layout Floor Plan
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-[#491546] to-[#632c5e] hover:from-[#632c5e] hover:to-[#904277] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-[#491546]/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
        >
          <Check className="w-5 h-5 text-[#fea0db] stroke-[3]" />
          <span>{initialEvent ? 'Save Event Changes' : 'Create & Launch Event'}</span>
        </button>
      </form>
    </div>
  );
};
