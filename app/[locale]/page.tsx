'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  UserPlus,
  HeartHandshake,
  CheckCircle2,
  Search,
  Compass,
  ArrowRight,
  Shield,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { sahayataStore } from '@/lib/store';

interface PageProps {
  params: { locale: string };
}

export default function CitizenLandingPage({ params: { locale } }: PageProps) {
  const t = useTranslations('landing');
  const common = useTranslations('common');
  const router = useRouter();

  const [trackIdInput, setTrackIdInput] = useState('');
  const [stats, setStats] = useState({
    totalReports: 0,
    safeCount: 0,
    missingCount: 0,
    unaccountedManifest: 0
  });

  useEffect(() => {
    const updateStats = () => {
      const state = sahayataStore.getState();
      const safe = state.reports.filter(r => r.status === 'located_safe' || r.status === 'reunited').length;
      const missing = state.reports.filter(r => r.status === 'received' || r.status === 'search_lead_issued').length;
      const manifestUnaccounted = state.preDisasterEntries.reduce(
        (acc, entry) => acc + (entry.status === 'overdue' ? entry.totalMembers : 0),
        0
      );

      setStats({
        totalReports: state.reports.length,
        safeCount: safe,
        missingCount: missing,
        unaccountedManifest: manifestUnaccounted
      });
    };

    sahayataStore.initClient();
    updateStats();
    return sahayataStore.subscribe(updateStats);
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackIdInput.trim()) {
      router.push(`/${locale}/track?caseId=${encodeURIComponent(trackIdInput.trim())}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* 1. Incident Status Card (Supabase Card: warm surface, hairline border, 12px radius) */}
      <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(0,26,16,0.08)] pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-medium text-[#001A10] bg-[#A9F1CA] px-2.5 py-0.5 rounded-[9999px]">
              INCIDENT ACTIVE
            </span>
            <span className="text-xs font-mono text-[#001A10]/60">INC-2026-NEP-042</span>
          </div>
          <span className="text-xs font-mono text-[#001A10]/60">
            Sector 3 • 28 Aug 2026
          </span>
        </div>

        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#001A10] tracking-normal">
            {t('incidentName')}
          </h2>
          <p className="text-sm font-[450] text-[#001A10]/70 mt-1 leading-relaxed max-w-2xl">
            {t('subheadline')}
          </p>
        </div>

        {/* 3 Metric Counters */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[rgba(0,26,16,0.08)] text-center font-mono">
          <div className="bg-[#F8F3EF] rounded-[8px] p-3 border border-[rgba(0,26,16,0.08)]">
            <div className="text-xl font-bold text-[#001A10]" suppressHydrationWarning>{stats.totalReports}</div>
            <div className="text-[11px] text-[#001A10]/60 font-sans">Reports Ingested</div>
          </div>
          <div className="bg-[#A9F1CA]/30 rounded-[8px] p-3 border border-[#6DD9A8] text-[#00482F]">
            <div className="text-xl font-bold" suppressHydrationWarning>{stats.safeCount}</div>
            <div className="text-[11px] font-sans">Confirmed Safe</div>
          </div>
          <div className="bg-rose-50 rounded-[8px] p-3 border border-rose-200 text-rose-800">
            <div className="text-xl font-bold" suppressHydrationWarning>{stats.unaccountedManifest}</div>
            <div className="text-[11px] font-sans">In Hazard Zone</div>
          </div>
        </div>
      </div>

      {/* 2. Hero Action Header */}
      <div className="space-y-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-normal text-[#00A85A]">
            Citizen Emergency Intake
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#001A10] tracking-normal mt-1">
            {t('headline')}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Action 1: Report Missing */}
          <Link
            href={`/${locale}/report`}
            className="group rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-5 hover:border-[#3ECF8E] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-semibold text-[#001A10]">
                    {t('reportMissing')}
                  </span>
                  <span className="font-mono text-[11px] text-[#00A85A]">
                    &lt; 2 mins
                  </span>
                </div>
                <p className="text-xs text-[#001A10]/70 mt-0.5 font-[450]">
                  {t('reportMissingDesc')}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#001A10]/40 group-hover:text-[#00A85A] group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Action 2: I Need Help */}
          <Link
            href={`/${locale}/report?mode=self_sos`}
            className="group rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-5 hover:border-[#3ECF8E] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-[8px] bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <span className="font-display text-base font-semibold text-[#001A10]">
                  {t('iNeedHelp')}
                </span>
                <p className="text-xs text-[#001A10]/70 mt-0.5 font-[450]">
                  {t('iNeedHelpDesc')}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#001A10]/40 group-hover:text-[#00A85A] group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Action 3: I am Safe */}
          <Link
            href={`/${locale}/report?mode=mark_safe`}
            className="group rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-5 hover:border-[#3ECF8E] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-[8px] bg-[#A9F1CA]/40 border border-[#6DD9A8] text-[#00482F] flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="font-display text-base font-semibold text-[#001A10]">
                  {t('imSafe')}
                </span>
                <p className="text-xs text-[#001A10]/70 mt-0.5 font-[450]">
                  {t('imSafeDesc')}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#001A10]/40 group-hover:text-[#00A85A] group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>

      {/* 3. Case Tracking Input Card */}
      <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-[#00A85A]" />
          <h3 className="font-display text-sm font-semibold text-[#001A10]">
            {t('trackHeading')}
          </h3>
        </div>
        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={trackIdInput}
            onChange={e => setTrackIdInput(e.target.value)}
            placeholder={t('trackPlaceholder')}
            className="flex-1 border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs font-mono text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-[8px] bg-[#3ECF8E] text-[#001A10] text-xs font-medium hover:bg-[#6DD9A8] transition-colors"
          >
            {t('trackButton')}
          </button>
        </form>
      </div>

      {/* 4. Pre-Disaster Route Entry Banner */}
      <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#00A85A] uppercase tracking-normal">
            <Compass className="h-3.5 w-3.5" />
            <span>Pre-Disaster Accountable Checkpoint Protocol</span>
          </div>
          <h3 className="font-display text-base font-semibold text-[#001A10]">
            {t('preDisasterPrompt')}
          </h3>
          <p className="text-xs text-[#001A10]/70 max-w-xl font-[450]">
            Agencies and trekking groups must register travel manifests before passing high-risk checkpoints to issue QR Emergency Identity Cards for offline identification.
          </p>
        </div>

        <Link
          href={`/${locale}/pre-disaster`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[8px] border border-[#001A10] bg-transparent text-[#001A10] text-xs font-medium hover:bg-[#001A10]/5 transition-colors whitespace-nowrap"
        >
          <span>Register Trip Manifest</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
