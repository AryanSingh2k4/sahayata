'use client';

import React, { useState } from 'react';
import { Shield, Lock, X, AlertCircle, Mail, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

export default function ClearanceModal() {
  const { isClearanceModalOpen, closeClearanceModal, clearanceModalReason, isLoading } = useAuth();

  const [email, setEmail] = useState('commander@ndrf.gov.in');
  const [password, setPassword] = useState('NDRF@2026Secure!');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isClearanceModalOpen) return null;

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
        setErrorMsg(data.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || 'Network communication error.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A10]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-[12px] border border-[rgba(0,26,16,0.12)] bg-white shadow-xl overflow-hidden p-6 sm:p-7 space-y-5">
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

        {errorMsg && (
          <div className="rounded-[6px] border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email & Password Sign In Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          <div>
            <label className="block font-mono text-[11px] text-[#001A10]/70 mb-1">
              Official NDRF Email
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-[#001A10]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="commander@ndrf.gov.in"
                className="w-full pl-9 pr-3 py-2 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-mono text-[11px] text-[#001A10]/70">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-[#00A85A] font-mono hover:underline flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <KeyRound className="h-4 w-4 text-[#001A10]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-[#F8F3EF] text-[#001A10] text-xs font-mono focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
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
              className="flex-1 py-2 px-3 rounded-[6px] bg-[#3ECF8E] text-[#001A10] font-semibold text-xs hover:bg-[#6DD9A8] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Shield className="h-3.5 w-3.5 text-[#001A10]" />
              <span>{submitting ? 'Signing in...' : 'Sign In with Email'}</span>
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-[rgba(0,26,16,0.06)] text-center text-[10px] font-mono text-[#001A10]/50">
          Encrypted Session • Official Government Access Only
        </div>
      </div>
    </div>
  );
}
