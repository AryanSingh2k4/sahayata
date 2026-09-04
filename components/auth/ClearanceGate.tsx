'use client';

import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, AlertCircle, KeyRound, Mail, UserCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

interface ClearanceGateProps {
  title?: string;
  subtitle?: string;
  facilityName?: string;
}

export default function ClearanceGate({
  title = 'Incident Command Authentication',
  subtitle = 'Official operational terminal for 8th Battalion NDRF Incident Command and verified field units.',
  facilityName = 'Tatopani Forward Command Sector'
}: ClearanceGateProps) {
  const { login, loginDemo, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'demo' | 'email' | 'serviceId'>('demo');

  const [email, setEmail] = useState('commander@ndrf.gov.in');
  const [password, setPassword] = useState('NDRF@2026Secure!');
  const [serviceId, setServiceId] = useState('NDRF-8BN-CMD-4091');
  const [pin, setPin] = useState('1234');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDemoClick = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    const result = await loginDemo();
    setSubmitting(false);
    if (!result.success) {
      setErrorMsg(result.message || 'Supabase demo authorization failed.');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      setSubmitting(false);
      if (res.ok && data.success) {
        window.location.reload();
      } else {
        setErrorMsg(data.message || 'Supabase authentication failed.');
      }
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || 'Network error.');
    }
  };

  const handleServiceIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    const result = await login(serviceId, pin);
    setSubmitting(false);
    if (!result.success) {
      setErrorMsg(result.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Header Ribbon matching Supabase Light-Mode */}
        <div className="space-y-2 border-b border-[rgba(0,26,16,0.06)] pb-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-[#00482F] bg-[#A9F1CA] px-2.5 py-0.5 rounded-[9999px] border border-[#6DD9A8] flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-[#00A85A]" />
              Government of India • NDRF Incident Command
            </span>
            <span className="font-mono text-[10px] text-[#001A10]/50 flex items-center gap-1">
              <Lock className="h-3 w-3 text-[#00A85A]" />
              Restricted Area
            </span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[#001A10]">
            {title}
          </h1>
          <p className="text-xs text-[#001A10]/70 font-[450] leading-relaxed">
            {subtitle}
          </p>
          <div className="font-mono text-[11px] text-[#00A85A]">
            Station: {facilityName} • Database: Supabase Live Cloud (ap-northeast-2)
          </div>
        </div>

        {/* Auth Method Selector Tabs */}
        <div className="flex rounded-[8px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] p-1 text-xs font-mono">
          <button
            type="button"
            onClick={() => { setAuthMode('demo'); setErrorMsg(null); }}
            className={`flex-1 py-1.5 px-2 rounded-[6px] transition-all font-medium flex items-center justify-center gap-1.5 ${
              authMode === 'demo'
                ? 'bg-white text-[#001A10] shadow-sm font-semibold'
                : 'text-[#001A10]/60 hover:text-[#001A10]'
            }`}
          >
            <span>⚡ 1-Click Pass</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('email'); setErrorMsg(null); }}
            className={`flex-1 py-1.5 px-2 rounded-[6px] transition-all font-medium flex items-center justify-center gap-1.5 ${
              authMode === 'email'
                ? 'bg-white text-[#001A10] shadow-sm font-semibold'
                : 'text-[#001A10]/60 hover:text-[#001A10]'
            }`}
          >
            <Mail className="h-3 w-3 text-[#00A85A]" />
            <span>Supabase Email</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('serviceId'); setErrorMsg(null); }}
            className={`flex-1 py-1.5 px-2 rounded-[6px] transition-all font-medium flex items-center justify-center gap-1.5 ${
              authMode === 'serviceId'
                ? 'bg-white text-[#001A10] shadow-sm font-semibold'
                : 'text-[#001A10]/60 hover:text-[#001A10]'
            }`}
          >
            <KeyRound className="h-3 w-3 text-[#00A85A]" />
            <span>Service PIN</span>
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: 1-Click Fast-Track Demo Pass */}
        {authMode === 'demo' && (
          <div className="rounded-[10px] border border-[#6DD9A8] bg-[#A9F1CA]/20 p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase font-bold text-[#00482F] flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-[#00A85A]" />
                Jury & Evaluator Fast-Track
              </span>
              <span className="font-mono text-[9px] bg-[#00482F] text-white px-2 py-0.5 rounded-[9999px]">
                Real Supabase JWT
              </span>
            </div>
            <p className="text-xs text-[#001A10]/80 leading-relaxed">
              Instantly signs into Supabase Auth as <strong>Commandant S. Rawat (8th Battalion NDRF)</strong>, minting authentic session tokens and unlocking military dispatch.
            </p>
            <button
              onClick={handleDemoClick}
              disabled={submitting || isLoading}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-semibold text-xs sm:text-sm hover:bg-[#6DD9A8] transition-all flex items-center justify-center gap-2 group shadow-none disabled:opacity-50"
            >
              <span>Authorize as 8th Bn Commander</span>
              <ArrowRight className="h-4 w-4 text-[#001A10] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Tab 2: Real Supabase Email & Password Form */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-[#001A10]/70 mb-1">
                Official Government Email (Supabase Auth)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="commander@ndrf.gov.in"
                className="w-full px-3.5 py-2.5 rounded-[8px] border border-[rgba(0,26,16,0.12)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#001A10]/70 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-[8px] border border-[rgba(0,26,16,0.12)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-semibold text-xs sm:text-sm hover:bg-[#6DD9A8] transition-all disabled:opacity-50"
            >
              {submitting ? 'Authenticating with Supabase...' : 'Sign In with Supabase Auth'}
            </button>
          </form>
        )}

        {/* Tab 3: Officer Service ID & PIN Form */}
        {authMode === 'serviceId' && (
          <form onSubmit={handleServiceIdSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-[#001A10]/70 mb-1">
                Officer Service ID
              </label>
              <input
                type="text"
                value={serviceId}
                onChange={e => setServiceId(e.target.value)}
                placeholder="NDRF-8BN-CMD-4091"
                className="w-full px-3.5 py-2.5 rounded-[8px] border border-[rgba(0,26,16,0.12)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-mono text-xs text-[#001A10]/70">
                  Officer PIN
                </label>
                <span className="font-mono text-[10px] text-[#00A85A]">(Demo PIN: 1234)</span>
              </div>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-3.5 py-2.5 rounded-[8px] border border-[rgba(0,26,16,0.12)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-semibold text-xs sm:text-sm hover:bg-[#6DD9A8] transition-all disabled:opacity-50"
            >
              {submitting ? 'Verifying Service Credentials...' : 'Authenticate Officer PIN'}
            </button>
          </form>
        )}

        {/* Footer Notice */}
        <div className="pt-2 border-t border-[rgba(0,26,16,0.06)] text-center text-[10px] font-mono text-[#001A10]/50">
          Supabase GoTrue Auth • Row Level Security Enabled • In compliance with IT Act Section 43A.
        </div>
      </div>
    </div>
  );
}
