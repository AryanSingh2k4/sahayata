'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Search,
  CheckCircle2,
  Building,
  Shield,
  HelpCircle,
  Phone,
  Lock,
  Eye,
  KeyRound
} from 'lucide-react';
import { sahayataStore } from '@/lib/store';
import { PersonReport } from '@/lib/types';
import { useAuth } from '@/lib/auth/AuthContext';
import { maskPhoneNumber, sanitizeShelterLocation } from '@/lib/auth/roles';

interface TrackPageProps {
  params: { locale: string };
}

export default function TrackPage({ params: { locale } }: TrackPageProps) {
  const t = useTranslations('track');
  const common = useTranslations('common');
  const searchParams = useSearchParams();
  const initialCaseId = searchParams.get('caseId') || 'SAH-2026-001458';

  const { isAuthenticated, user, openClearanceModal } = useAuth();
  const [queryId, setQueryId] = useState(initialCaseId);
  const [report, setReport] = useState<PersonReport | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    sahayataStore.initClient();
    if (initialCaseId) {
      handleSearch(initialCaseId);
    }
  }, [initialCaseId]);

  const handleSearch = (idToSearch: string) => {
    const clean = idToSearch.trim();
    if (!clean) return;

    const state = sahayataStore.getState();
    const found = state.reports.find(
      r => r.id.toLowerCase() === clean.toLowerCase()
    );

    setReport(found || null);
    setSearched(true);
  };

  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    const order = [
      'received',
      'under_verification',
      'search_lead_issued',
      'located_safe',
      'reunited'
    ];

    let currentIndex = order.indexOf(currentStatus);
    if (currentIndex === -1) {
      if (currentStatus === 'located_injured') currentIndex = 3;
      else if (currentStatus === 'identity_pending') currentIndex = 1;
      else currentIndex = 0;
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="font-mono text-xs uppercase text-[#00A85A]">
          Verification Lifecycle
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#001A10]">
          {t('title')}
        </h1>
        <p className="text-xs sm:text-sm text-[#001A10]/70 max-w-lg mx-auto font-[450]">
          {t('subtitle')}
        </p>
      </div>

      {/* Search Input Box */}
      <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-3">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSearch(queryId);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-[#001A10]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryId}
              onChange={e => setQueryId(e.target.value)}
              placeholder="e.g. SAH-2026-001458"
              className="w-full pl-9 pr-4 py-2 border border-[rgba(0,26,16,0.08)] rounded-[8px] text-xs font-mono font-medium text-[#001A10] bg-[#F8F3EF] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-[8px] bg-[#3ECF8E] text-[#001A10] text-xs font-medium hover:bg-[#6DD9A8] transition-colors"
          >
            {common('search')}
          </button>
        </form>

        {/* Demo shortcuts */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#001A10]/60">
          <span>Quick Lookup:</span>
          <button
            type="button"
            onClick={() => {
              setQueryId('SAH-2026-001458');
              handleSearch('SAH-2026-001458');
            }}
            className="px-2 py-0.5 rounded-[6px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] font-mono text-[11px] text-[#001A10] hover:bg-[#F8F3EF]/80"
          >
            Dr. Milind Chitley (P0 Lead)
          </button>
          <button
            type="button"
            onClick={() => {
              setQueryId('SAH-2026-001459');
              handleSearch('SAH-2026-001459');
            }}
            className="px-2 py-0.5 rounded-[6px] border border-[#6DD9A8] bg-[#A9F1CA]/30 text-[#00482F] font-mono text-[11px]"
          >
            Dr. Janhavi Chitley (Safe)
          </button>
        </div>
      </div>

      {/* Case Details Card */}
      {report ? (
        <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[rgba(0,26,16,0.08)] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium text-[#001A10]/60 uppercase">
                  CASE ID: {report.id}
                </span>
              </div>
              <h2 className="font-display text-xl font-semibold text-[#001A10] mt-0.5">
                {report.fullName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#001A10]/70 mt-1">
                <span>Age {report.approxAge}</span>
                <span>•</span>
                <span className="capitalize">{report.gender}</span>
                {report.groupName && (
                  <>
                    <span>•</span>
                    <span className="text-[#00A85A] font-medium">{report.groupName}</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center px-3 py-0.5 rounded-[9999px] text-xs font-mono font-medium uppercase ${
                  report.status === 'located_safe' || report.status === 'reunited'
                    ? 'bg-[#A9F1CA]/40 text-[#00482F] border border-[#6DD9A8]'
                    : report.status === 'search_lead_issued'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {report.status.replace(/_/g, ' ')}
              </span>
              <div className="text-[11px] font-mono text-[#001A10]/50 mt-1">
                Updated {new Date(report.updatedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-[#001A10]/60">
              {t('timelineHeading')}
            </h3>

            <div className="relative border-l border-[rgba(0,26,16,0.1)] ml-3 pl-5 space-y-5 py-1">
              {[
                { title: t('stage1'), desc: 'Ingested into national emergency database with automated priority scoring' },
                { title: t('stage2'), desc: 'Cross-referenced against carrier manifests and checkpost logs' },
                { title: t('stage3'), desc: report.assignedTeamId ? `Dispatched to ${report.assignedTeamId}` : 'Search lead assigned to sector rescue team' },
                { title: t('stage4'), desc: report.safeDiscloseLocation ? `Located safe at ${report.safeDiscloseLocation}` : 'Active search underway' },
                { title: t('stage5'), desc: 'Reunification coordination protocol' }
              ].map((stepItem, idx) => {
                const status = getStepStatus(idx, report.status);
                return (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2 transition-all ${
                        status === 'completed'
                          ? 'bg-[#00A85A] border-[#00A85A]'
                          : status === 'current'
                          ? 'bg-[#3ECF8E] border-[#001A10] ring-4 ring-[#95E6B8]/40'
                          : 'bg-white border-[#001A10]/30'
                      }`}
                    />
                    <div>
                      <div
                        className={`text-xs font-medium ${
                          status === 'completed'
                            ? 'text-[#00482F]'
                            : status === 'current'
                            ? 'text-[#001A10] font-semibold'
                            : 'text-[#001A10]/40'
                        }`}
                      >
                        {stepItem.title}
                      </div>
                      <p className="text-[11px] text-[#001A10]/60 mt-0.5">{stepItem.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safe Facility Disclosure */}
          {/* Attached Verified Document Card */}
          {report.attachedDocument && (
            <div className="rounded-[8px] border border-[#6DD9A8] bg-[#A9F1CA]/20 p-4 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold text-[#00482F] flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-[#00A85A]" />
                  Verified Identity / Travel Document Linked
                </span>
                <span className="font-mono text-[10px] bg-[#00482F] text-white px-2 py-0.5 rounded-[9999px]">
                  {report.attachedDocument.confidenceScore}% Confidence Match
                </span>
              </div>
              <div className="font-semibold text-[#001A10]">
                {report.attachedDocument.documentType} — {report.attachedDocument.documentNumberMasked}
              </div>
              <div className="text-[#001A10]/70 flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
                {report.attachedDocument.issuerOrAgency && (
                  <span><strong>Issuer / Carrier:</strong> {report.attachedDocument.issuerOrAgency}</span>
                )}
                {report.attachedDocument.seatOrRoom && (
                  <span><strong>Seat / Room:</strong> {report.attachedDocument.seatOrRoom}</span>
                )}
                {report.attachedDocument.route && (
                  <span><strong>Transit Route:</strong> {report.attachedDocument.route}</span>
                )}
              </div>
            </div>
          )}

          {/* Primary Reporter & Emergency Contact Telemetry (PII Masked in Citizen View) */}
          <div className={`rounded-[8px] border p-4 space-y-2.5 ${
            isAuthenticated
              ? 'border-[#6DD9A8] bg-[#A9F1CA]/20'
              : 'border-[rgba(0,26,16,0.12)] bg-[#F8F3EF]/70'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 ${
                isAuthenticated ? 'text-[#00482F]' : 'text-[#001A10]/70'
              }`}>
                {isAuthenticated ? (
                  <>
                    <Shield className="h-3.5 w-3.5 text-[#00A85A]" />
                    NDRF Commander Clearance Active • Unredacted Telemetry
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-[#00A85A]" />
                    DPDP Act 2023 Data Protection • PII Masked
                  </>
                )}
              </span>
              {!isAuthenticated && (
                <button
                  onClick={openClearanceModal}
                  className="font-mono text-[10px] text-[#00A85A] hover:underline flex items-center gap-1"
                >
                  <KeyRound className="h-3 w-3" />
                  Official NDRF Clearance Login
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-[#001A10]/60 block font-mono text-[10px] uppercase">Primary Reporter</span>
                <span className="font-semibold text-[#001A10]">{report.reporterName}</span>
                <span className="text-[#001A10]/60 ml-1.5">({report.reporterRelationship})</span>
              </div>
              <div>
                <span className="text-[#001A10]/60 block font-mono text-[10px] uppercase">Emergency Contact</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Phone className="h-3.5 w-3.5 text-[#00A85A]" />
                  <span className="font-mono font-medium text-[#001A10]">
                    {maskPhoneNumber(report.reporterPhone, isAuthenticated ? 'ROLE_NDRF_OFFICIAL' : 'ROLE_CITIZEN')}
                  </span>
                  {isAuthenticated ? (
                    <span className="text-[9px] font-mono bg-[#00482F] text-white px-1.5 py-0.5 rounded-[4px]">
                      VERIFIED OFFICER VIEW
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono bg-[rgba(0,26,16,0.08)] text-[#001A10]/60 px-1.5 py-0.5 rounded-[4px]">
                      PROTECTED
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {report.safeDiscloseLocation && (
            <div className="rounded-[8px] border border-[#6DD9A8] bg-[#A9F1CA]/20 p-4 flex items-start gap-3">
              <Building className="h-4 w-4 text-[#00A85A] shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-mono text-[#00482F] uppercase">
                  Verified Safe Facility Location
                </div>
                <div className="text-sm font-bold text-[#001A10] mt-0.5">
                  {sanitizeShelterLocation(report.safeDiscloseLocation, isAuthenticated ? 'ROLE_NDRF_OFFICIAL' : 'ROLE_CITIZEN')}
                </div>
                <div className="text-xs text-[#001A10]/70 mt-1">
                  Verified by: {report.verifiedBy} ({report.verifiedAt ? new Date(report.verifiedAt).toLocaleTimeString() : 'Recent'})
                </div>
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="rounded-[8px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] p-3.5 flex items-start gap-2.5 text-xs text-[#001A10]/70">
            <Shield className="h-4 w-4 shrink-0 mt-0.5 text-[#00A85A]" />
            <p>{t('safeNotice')}</p>
          </div>
        </div>
      ) : searched ? (
        <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-8 text-center space-y-3">
          <HelpCircle className="h-8 w-8 text-[#001A10]/40 mx-auto" />
          <h3 className="font-display text-sm font-semibold text-[#001A10]">
            No Report Found for "{queryId}"
          </h3>
          <p className="text-xs text-[#001A10]/60 max-w-sm mx-auto font-[450]">
            Please check the Case ID spelling or submit a new missing person report.
          </p>
          <Link
            href={`/${locale}/report`}
            className="inline-flex px-4 py-2 rounded-[8px] bg-[#3ECF8E] text-[#001A10] text-xs font-medium hover:bg-[#6DD9A8] transition-colors"
          >
            File New Report
          </Link>
        </div>
      ) : null}
    </div>
  );
}
