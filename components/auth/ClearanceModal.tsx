'use client';

import React, { useState } from 'react';
import { Shield, Lock, X, ArrowRight, AlertCircle, KeyRound, Mail, UserCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

export default function ClearanceModal() {
  const { isClearanceModalOpen, closeClearanceModal, clearanceModalReason, login, loginDemo, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'demo' | 'email' | 'serviceId'>('demo');

  const [email, setEmail] = useState('commander@ndrf.gov.in');
  const [password, setPassword] = useState('NDRF@2026Secure!');
  const [serviceId, setServiceId] = useState('NDRF-8BN-CMD-4091');
  const [pin, setPin] = useState('1234');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isClearanceModalOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A10]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[12px] border border-[rgba(0,26,16,0.12)] bg-white shadow-xl overflow-hidden p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[rgba(0,26,16,0.06)] pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-[#00482F] bg-[#A9F1CA] px-2 py-0.5 rounded-[9999px] border border-[#6DD9A8] inline-flex items-center gap-1.5 mb-1.5">
              <Shield className="h-3 w-3 text-[#00A85A]" />
              NDRF Security Clearance
            </span>
            <h3 className="font-display text-lg font-semibold text-[#001A10]">
              Incident Command Authentication
            </h3>
            <p className="text-xs text-[#001A10]/70 mt-0.5 font-[450]">
              Official access terminal for 8th Battalion NDRF Incident Command.
            </p>
          </div>
          <button
            onClick={closeClearanceModal}
            className="p-1.5 rounded-[6px] text-[#001A10]/50 hover:text-[#001A10] hover:bg-[#001A10]/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {clearanceModalReason && (
          <div className="rounded-[8px] border border-[#3ECF8E]/40 bg-[#A9F1CA]/20 p-2.5 text-xs text-[#00482F] flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-[#00A85A]" />
            <span className="font-medium">{clearanceModalReason}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex rounded-[8px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] p-1 text-xs font-mono">
          <button
            type="button"
            onClick={() => { setAuthMode('demo'); setErrorMsg(null); }}
            className={`flex-1 py-1 px-2 rounded-[6px] transition-all font-medium flex items-center justify-center gap-1 ${
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
            className={`flex-1 py-1 px-2 rounded-[6px] transition-all font-medium flex items-center justify-center gap-1 ${
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
            className={`flex-1 py-1 px-2 rounded-[6px] transition-all font-medium flex items-center justify-center gap-1 ${
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
          <div className="rounded-[6px] border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: 1-Click Fast Pass */}
        {authMode === 'demo' && (
          <div className="rounded-[8px] border border-[#6DD9A8] bg-[#A9F1CA]/20 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase font-bold text-[#00482F] flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-[#00A85A]" />
                Fast-Track Evaluation Mode
              </span>
              <span className="font-mono text-[9px] bg-[#00482F] text-white px-2 py-0.5 rounded-[9999px]">
                Real Supabase Auth
              </span>
            </div>
            <p className="text-xs text-[#001A10]/80 leading-relaxed">
              Instantly signs into Supabase as <strong>Commandant S. Rawat (8th Battalion NDRF)</strong> and unlocks live military dispatch controls.
            </p>
            <button
              onClick={handleDemoClick}
              disabled={submitting || isLoading}
              className="w-full py-2.5 px-3 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-semibold text-xs hover:bg-[#6DD9A8] transition-all flex items-center justify-center gap-2 group shadow-none disabled:opacity-50"
            >
              <span>Authorize as 8th Bn Commander</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#001A10] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Tab 2: Email & Password */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <label className="block font-mono text-[11px] text-[#001A10]/70 mb-1">
                Official Email (Supabase Auth)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="commander@ndrf.gov.in"
                className="w-full px-3 py-2 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] text-[#001A10]/70 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={closeClearanceModal}
                className="py-2 px-3 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-white text-[#001A10] text-xs font-medium hover:bg-[#F8F3EF] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isLoading}
                className="flex-1 py-2 px-3 rounded-[6px] bg-[#3ECF8E] text-[#001A10] font-semibold text-xs hover:bg-[#6DD9A8] transition-all disabled:opacity-50"
              >
                {submitting ? 'Signing in...' : 'Sign In with Supabase'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Service ID & PIN */}
        {authMode === 'serviceId' && (
          <form onSubmit={handleServiceIdSubmit} className="space-y-3">
            <div>
              <label className="block font-mono text-[11px] text-[#001A10]/70 mb-1">
                Officer Service ID
              </label>
              <input
                type="text"
                value={serviceId}
                onChange={e => setServiceId(e.target.value)}
                placeholder="NDRF-8BN-CMD-4091"
                className="w-full px-3 py-2 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-mono text-[11px] text-[#001A10]/70">
                  Officer PIN
                </label>
                <span className="font-mono text-[10px] text-[#00A85A]">(Demo: 1234)</span>
              </div>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-3 py-2 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={closeClearanceModal}
                className="py-2 px-3 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-white text-[#001A10] text-xs font-medium hover:bg-[#F8F3EF] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isLoading}
                className="flex-1 py-2 px-3 rounded-[6px] bg-[#3ECF8E] text-[#001A10] font-semibold text-xs hover:bg-[#6DD9A8] transition-all disabled:opacity-50"
              >
                {submitting ? 'Verifying...' : 'Authenticate'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
