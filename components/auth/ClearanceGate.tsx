'use client';

import React, { useState } from 'react';
import { Shield, Lock, AlertCircle, Mail, KeyRound, Eye, EyeOff } from 'lucide-react';
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
  const { isLoading } = useAuth();

  const [email, setEmail] = useState('commander@ndrf.gov.in');
  const [password, setPassword] = useState('NDRF@2026Secure!');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        setErrorMsg(data.message || 'Authentication failed. Please check credentials.');
      }
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || 'Network communication error.');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Header */}
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
            Station: {facilityName} • Incident Command Network
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email & Password Sign In Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-[#001A10]/70 mb-1">
              Official NDRF Email
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-[#001A10]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="commander@ndrf.gov.in"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-[8px] border border-[rgba(0,26,16,0.12)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-mono text-xs text-[#001A10]/70">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#00A85A] font-mono hover:underline flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <KeyRound className="h-4 w-4 text-[#001A10]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-[8px] border border-[rgba(0,26,16,0.12)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="w-full py-2.5 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-semibold text-xs sm:text-sm hover:bg-[#6DD9A8] transition-all disabled:opacity-50 flex items-center justify-center"
          >
            <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Notice */}
        <div className="pt-2 border-t border-[rgba(0,26,16,0.06)] text-center text-[10px] font-mono text-[#001A10]/50">
          Encrypted TLS 1.3 • Row-Level Access Security • IT Act Section 43A Compliant
        </div>
      </div>
    </div>
  );
}
