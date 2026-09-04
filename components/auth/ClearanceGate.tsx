'use client';

import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

interface ClearanceGateProps {
  title?: string;
  subtitle?: string;
  facilityName?: string;
}

export default function ClearanceGate({
  title = 'NDRF Tactical Operations Center (EOC)',
  subtitle = 'Restricted operational terminal for 8th Battalion Incident Command and verified field units.',
  facilityName = 'Tatopani Forward Command Sector'
}: ClearanceGateProps) {
  const { login, loginDemo, isLoading } = useAuth();
  const [serviceId, setServiceId] = useState('NDRF-8BN-CMD-4091');
  const [pin, setPin] = useState('1234');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    const result = await login(serviceId, pin);
    setSubmitting(false);
    if (!result.success) {
      setErrorMsg(result.message || 'Authentication failed. Please verify credentials.');
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
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full rounded-[16px] border border-[rgba(0,26,16,0.1)] bg-white shadow-sm overflow-hidden">
        {/* Top Header Ribbon */}
        <div className="bg-[#001A10] text-white px-6 py-5 flex items-center justify-between border-b border-[rgba(0,26,16,0.15)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[10px] bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-wider uppercase text-[#3ECF8E] font-semibold">
                GOVERNMENT OF INDIA • NDRF
              </div>
              <h2 className="font-display text-base font-semibold text-white tracking-normal">
                {title}
              </h2>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-mono bg-white/10 text-white/80">
            <Lock className="h-3 w-3 text-[#3ECF8E]" />
            RESTRICTED ACCESS
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Informational Box */}
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs text-[#001A10]/70 font-[450] leading-relaxed">
              {subtitle}
            </p>
            <div className="text-[11px] font-mono text-[#00A85A]">
              Designated Station: {facilityName}
            </div>
          </div>

          {/* Section 1: 1-Click Fast-Track Demo Pass */}
          <div className="rounded-[12px] border border-[#6DD9A8] bg-[#A9F1CA]/25 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase font-bold text-[#00482F] flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-[#00A85A]" />
                Hackathon Jury / Evaluation Mode
              </span>
              <span className="font-mono text-[10px] bg-[#00482F] text-white px-2 py-0.5 rounded-[9999px]">
                Instant Token Minting
              </span>
            </div>
            <p className="text-xs text-[#001A10]/80">
              One-click cryptographic clearance elevation as <strong>Commandant S. Rawat (8th Battalion NDRF)</strong>. Automatically sets signed HttpOnly session cookie.
            </p>
            <button
              onClick={handleDemoClick}
              disabled={submitting || isLoading}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#001A10] text-white font-medium text-xs sm:text-sm hover:bg-[#002819] transition-all flex items-center justify-center gap-2 group shadow-sm disabled:opacity-50"
            >
              <span className="text-[#3ECF8E] font-bold">⚡</span>
              <span>1-Click Demo Pass: Authorize as 8th Bn Commander</span>
              <ArrowRight className="h-4 w-4 text-[#3ECF8E] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[rgba(0,26,16,0.1)] w-full" />
            <span className="bg-white px-3 font-mono text-[10px] uppercase text-[#001A10]/40 tracking-wider whitespace-nowrap">
              Or Authenticate with Service Credentials
            </span>
          </div>

          {/* Section 2: Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {errorMsg && (
              <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-mono text-xs text-[#001A10]/70 mb-1">
                Official Officer Service ID
              </label>
              <input
                type="text"
                value={serviceId}
                onChange={e => setServiceId(e.target.value)}
                placeholder="e.g. NDRF-8BN-CMD-4091"
                className="w-full px-3.5 py-2.5 rounded-[8px] border border-[rgba(0,26,16,0.15)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-mono text-xs text-[#001A10]/70">
                  Officer PIN / Security Passcode
                </label>
                <span className="font-mono text-[10px] text-[#00A85A]">
                  (Demo PIN: 1234)
                </span>
              </div>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-3.5 py-2.5 rounded-[8px] border border-[rgba(0,26,16,0.15)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-semibold text-xs sm:text-sm hover:bg-[#6DD9A8] transition-all disabled:opacity-50"
            >
              {submitting ? 'Verifying Security Clearance...' : 'Verify Clearance & Access Command Center'}
            </button>
          </form>

          {/* Zero-Trust Notice */}
          <div className="pt-2 border-t border-[rgba(0,26,16,0.06)] text-center text-[10px] font-mono text-[#001A10]/50">
            Defense Zero-Trust Protocol • In accordance with Disaster Management Act 2005 & DPDP Act 2023.
          </div>
        </div>
      </div>
    </div>
  );
}
