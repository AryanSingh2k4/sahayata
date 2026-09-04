'use client';

import React, { useState } from 'react';
import { Shield, Lock, X, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

export default function ClearanceModal() {
  const { isClearanceModalOpen, closeClearanceModal, login, loginDemo, isLoading } = useAuth();
  const [serviceId, setServiceId] = useState('NDRF-8BN-CMD-4091');
  const [pin, setPin] = useState('1234');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isClearanceModalOpen) return null;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    const result = await login(serviceId, pin);
    setSubmitting(false);
    if (!result.success) {
      setErrorMsg(result.message || 'Authentication failed.');
    }
  };

  const handleDemoClick = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    const result = await loginDemo();
    setSubmitting(false);
    if (!result.success) {
      setErrorMsg(result.message || 'Demo authorization failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A10]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[16px] border border-[rgba(0,26,16,0.12)] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#001A10] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[8px] bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-wider uppercase text-[#3ECF8E] font-semibold">
                NDRF CLEARANCE PORTAL
              </div>
              <h3 className="font-display text-sm sm:text-base font-semibold text-white">
                Officer Security Authentication
              </h3>
            </div>
          </div>
          <button
            onClick={closeClearanceModal}
            className="p-1 rounded-[6px] text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Demo 1-Click Fast-Track */}
          <div className="rounded-[10px] border border-[#6DD9A8] bg-[#A9F1CA]/25 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase font-bold text-[#00482F] flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5 text-[#00A85A]" />
                Fast-Track Demo Clearance
              </span>
              <span className="font-mono text-[9px] bg-[#00482F] text-white px-2 py-0.5 rounded-[9999px]">
                Jury Mode
              </span>
            </div>
            <p className="text-xs text-[#001A10]/80">
              Instantly authenticate as <strong>Commandant S. Rawat (8th Bn NDRF)</strong> and unlock all command controls with real signed session cookies.
            </p>
            <button
              onClick={handleDemoClick}
              disabled={submitting || isLoading}
              className="w-full py-2.5 px-3 rounded-[8px] bg-[#001A10] text-white font-medium text-xs hover:bg-[#002819] transition-all flex items-center justify-center gap-2 group shadow-sm disabled:opacity-50"
            >
              <span className="text-[#3ECF8E]">⚡</span>
              <span>1-Click Demo Pass: Elevate to Commander</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#3ECF8E] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[rgba(0,26,16,0.1)] w-full" />
            <span className="bg-white px-2.5 font-mono text-[9px] uppercase text-[#001A10]/40 tracking-wider whitespace-nowrap">
              Or Officer Credentials
            </span>
          </div>

          <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="rounded-[6px] border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-mono text-[11px] text-[#001A10]/70 mb-1">
                Official Service ID
              </label>
              <input
                type="text"
                value={serviceId}
                onChange={e => setServiceId(e.target.value)}
                placeholder="NDRF-8BN-CMD-4091"
                className="w-full px-3 py-2 rounded-[6px] border border-[rgba(0,26,16,0.15)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-mono text-[11px] text-[#001A10]/70">
                  Officer PIN
                </label>
                <span className="font-mono text-[10px] text-[#00A85A]">
                  (Demo: 1234)
                </span>
              </div>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-3 py-2 rounded-[6px] border border-[rgba(0,26,16,0.15)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={closeClearanceModal}
                className="py-2 px-4 rounded-[6px] border border-[rgba(0,26,16,0.15)] bg-white text-[#001A10] text-xs font-medium hover:bg-[#F8F3EF] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isLoading}
                className="flex-1 py-2 px-4 rounded-[6px] bg-[#3ECF8E] text-[#001A10] font-semibold text-xs hover:bg-[#6DD9A8] transition-all disabled:opacity-50"
              >
                {submitting ? 'Verifying...' : 'Authenticate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
