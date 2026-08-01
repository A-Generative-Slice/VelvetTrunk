import React from 'react';
import { Home, PlusCircle, CheckCircle2, Database } from 'lucide-react';

export type NavTab = 'home' | 'create' | 'completed' | 'supabase';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#fff7fa]/95 backdrop-blur-lg border-t border-[#e9e0e4] pb-safe shadow-lg">
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
          onClick={() => onSelectTab('supabase')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'supabase'
              ? 'text-[#491546] font-bold scale-105'
              : 'text-[#81737c] hover:text-[#491546]'
          }`}
        >
          <Database className={`w-5 h-5 ${currentTab === 'supabase' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] font-medium tracking-wider uppercase mt-0.5">DB Sync</span>
        </button>
      </div>
    </nav>
  );
};
