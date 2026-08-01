import React from 'react';
import { Home, PlusCircle, CheckCircle2, Database, Store, Sparkles, Headphones } from 'lucide-react';

export type NavTab = 'home' | 'create' | 'completed' | 'support' | 'supabase';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isSupabaseConnected: boolean;
  onOpenSupabaseModal: () => void;
  onOpenSupportModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  isSupabaseConnected,
  onOpenSupabaseModal,
  onOpenSupportModal,
}) => {
  return (
    <>
      {/* Desktop / PC Navbar (Hidden on Mobile) */}
      <nav className="hidden md:block sticky top-0 z-50 bg-[#fff7fa]/90 backdrop-blur-md border-b border-[#e9e0e4] shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 text-left focus:outline-hidden group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#491546] to-[#632c5e] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6 text-[#f7b0eb]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#491546]">
                  The Velvet Trunk
                </span>
                <Sparkles className="w-4 h-4 text-[#904277]" />
              </div>
              <p className="text-[11px] text-[#81737c] font-semibold tracking-wider uppercase">
                Event Concierge & Stall Manager
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                currentTab === 'home'
                  ? 'bg-[#491546] text-white shadow-xs'
                  : 'text-[#4f434c] hover:bg-[#f4ecef] hover:text-[#491546]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => onSelectTab('create')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                currentTab === 'create'
                  ? 'bg-[#491546] text-white shadow-xs'
                  : 'text-[#4f434c] hover:bg-[#f4ecef] hover:text-[#491546]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Event</span>
            </button>

            <button
              onClick={() => onSelectTab('completed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                currentTab === 'completed'
                  ? 'bg-[#491546] text-white shadow-xs'
                  : 'text-[#4f434c] hover:bg-[#f4ecef] hover:text-[#491546]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed Events</span>
            </button>

            <button
              onClick={onOpenSupportModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#4f434c] hover:bg-[#f4ecef] hover:text-[#491546] transition-all"
            >
              <Headphones className="w-4 h-4 text-[#904277]" />
              <span>Support</span>
            </button>
          </div>

          {/* DB Sync & Supabase Status Button */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 shadow-2xs ${
              isSupabaseConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-[#f4ecef] text-[#491546] border-[#d2c2cc] hover:bg-[#e9e0e4]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{isSupabaseConnected ? 'Supabase Connected' : 'Connect Supabase'}</span>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation (Hidden on PC/Desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fff7fa]/95 backdrop-blur-lg border-t border-[#e9e0e4] pb-safe shadow-lg">
        <div className="max-w-md mx-auto h-16 flex items-center justify-around px-2">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              currentTab === 'home'
                ? 'text-[#491546] font-bold scale-105'
                : 'text-[#81737c] hover:text-[#491546]'
            }`}
          >
            <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[11px] font-medium tracking-wider uppercase mt-0.5">Home</span>
          </button>

          <button
            onClick={() => onSelectTab('create')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              currentTab === 'create'
                ? 'text-[#491546] font-bold scale-105'
                : 'text-[#81737c] hover:text-[#491546]'
            }`}
          >
            <PlusCircle className={`w-5 h-5 ${currentTab === 'create' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[11px] font-medium tracking-wider uppercase mt-0.5">Create</span>
          </button>

          <button
            onClick={() => onSelectTab('completed')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              currentTab === 'completed'
                ? 'text-[#491546] font-bold scale-105'
                : 'text-[#81737c] hover:text-[#491546]'
            }`}
          >
            <CheckCircle2 className={`w-5 h-5 ${currentTab === 'completed' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[11px] font-medium tracking-wider uppercase mt-0.5">History</span>
          </button>

          <button
            onClick={onOpenSupportModal}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all text-[#81737c] hover:text-[#491546]"
          >
            <Headphones className="w-5 h-5 stroke-2 text-[#904277]" />
            <span className="text-[11px] font-medium tracking-wider uppercase mt-0.5">Support</span>
          </button>
        </div>
      </nav>
    </>
  );
};
