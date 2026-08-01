import React, { useState, useEffect } from 'react';
import { SupabaseConfig } from '../types';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  SUPABASE_SETUP_SQL,
} from '../lib/storage';
import {
  Database,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Download,
  Upload,
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onSync,
  onExportData,
  onImportData,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = getSupabaseConfig();
      if (existing) {
        setUrl(existing.url);
        setAnonKey(existing.anonKey);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      setStatusMsg('Please provide both Supabase Project URL and Anon Key.');
      return;
    }

    saveSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
    });

    setStatusMsg('Supabase configuration saved successfully! Attempting sync...');
    setTimeout(() => {
      onSync();
      onClose();
    }, 800);
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setStatusMsg('Supabase credentials cleared. Using local offline storage.');
    onSync();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-[#ffffff] rounded-2xl max-w-md w-full max-h-[92vh] flex flex-col border border-[#e9e0e4] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#fff7fa] border-b border-[#e9e0e4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#491546] text-white flex items-center justify-center">
              <Database className="w-5 h-5 text-[#fea0db]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#491546]">Supabase Persistence</h3>
              <p className="text-[11px] text-[#81737c]">Free Cloud Backend & Offline Sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#e9e0e4] text-[#491546] flex items-center justify-center font-bold hover:bg-[#d2c2cc]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">Offline + Cloud Backup Enabled</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                All event and stall booking data persists locally in browser storage immediately, and syncs to Supabase when connected!
              </p>
            </div>
          </div>

          {statusMsg && (
            <div className="p-2.5 bg-[#faf1f5] border border-[#d2c2cc] font-bold text-[#491546] text-xs rounded-xl">
              {statusMsg}
            </div>
          )}

          {/* Form */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#491546]">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project-ref.supabase.co"
                className="w-full px-3 py-2 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs text-[#1e1a1d] focus:outline-hidden focus:border-[#491546]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#491546]">
                Supabase Anon Key
              </label>
              <textarea
                rows={2}
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-[#ffffff] border border-[#d2c2cc] rounded-xl text-xs font-mono text-[#1e1a1d] focus:outline-hidden focus:border-[#491546]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-[#491546] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#632c5e] active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Save & Sync Supabase
              </button>
              {getSupabaseConfig() && (
                <button
                  onClick={handleClear}
                  className="py-2.5 px-3 bg-red-50 text-red-600 font-bold text-xs rounded-xl border border-red-200 hover:bg-red-100 active:scale-95 transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Backup & Import Tools */}
          <div className="pt-3 border-t border-[#f4ecef] space-y-2">
            <span className="font-bold text-[#491546] uppercase tracking-wider text-[11px] block">
              Data Backup & Transfer
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onExportData}
                className="py-2 px-3 bg-[#faf1f5] border border-[#d2c2cc] text-[#491546] font-bold text-xs rounded-xl hover:bg-[#e9e0e4] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#904277]" /> Export Backup
              </button>

              <label className="py-2 px-3 bg-[#faf1f5] border border-[#d2c2cc] text-[#491546] font-bold text-xs rounded-xl hover:bg-[#e9e0e4] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all">
                <Upload className="w-3.5 h-3.5 text-[#904277]" /> Import JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onImportData(f);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* SQL Setup Snippet Drawer */}
          <div className="pt-3 border-t border-[#f4ecef]">
            <button
              onClick={() => setShowSql(!showSql)}
              className="text-xs font-bold text-[#904277] hover:text-[#491546] flex items-center gap-1 underline"
            >
              {showSql ? 'Hide Supabase SQL Schema' : 'Show Free Supabase SQL Schema setup script'}
            </button>

            {showSql && (
              <div className="mt-2 space-y-2 bg-[#1e1a1d] text-emerald-400 p-3 rounded-xl border border-[#414042] text-[11px] font-mono">
                <div className="flex items-center justify-between text-[#e5e1e3]">
                  <span className="font-bold">Copy into Supabase SQL Editor</span>
                  <button
                    onClick={handleCopySql}
                    className="px-2 py-1 bg-[#414042] hover:bg-[#632c5e] text-white rounded-md text-[10px] font-bold flex items-center gap-1"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {isCopied ? 'Copied!' : 'Copy SQL'}
                  </button>
                </div>
                <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap text-[10px] leading-tight">
                  {SUPABASE_SETUP_SQL}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
