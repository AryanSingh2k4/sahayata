'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Shield,
  AlertCircle,
  Users,
  CheckCircle2,
  HeartPulse,
  Compass,
  Search,
  Layers,
  Camera,
  Activity,
  Send,
  UserCheck,
  Download,
  Lock,
  ArrowRight
} from 'lucide-react';
import IncidentMap from '@/components/map/IncidentMap';
import { sahayataStore, AppState } from '@/lib/store';
import { PersonReport, CoTravelerGroup, NDRFUnit } from '@/lib/types';
import { matchPatientPhoto, FaceMatchResult } from '@/lib/ai/faceMatcher';
import { useAuth } from '@/lib/auth/AuthContext';

interface DashboardProps {
  params: { locale: string };
}

export default function AuthorityDashboard({ params: { locale } }: DashboardProps) {
  const t = useTranslations('dashboard');
  const common = useTranslations('common');
  const { isAuthenticated, user, isCommander, isLoading: authLoading, openClearanceModal } = useAuth();

  const [state, setState] = useState<AppState>(sahayataStore.getState());
  const [activeTab, setActiveTab] = useState<'map' | 'priority' | 'groups' | 'registry' | 'face'>('map');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<PersonReport | null>(null);
  const [assignModalReport, setAssignModalReport] = useState<PersonReport | null>(null);
  const [verifyModalReport, setVerifyModalReport] = useState<PersonReport | null>(null);

  const [faceResults, setFaceResults] = useState<FaceMatchResult[]>([]);
  const [faceSearching, setFaceSearching] = useState(false);

  useEffect(() => {
    sahayataStore.initClient();
    return sahayataStore.subscribe(newState => {
      setState({ ...newState });
    });
  }, []);

  const totalEntrants = state.preDisasterEntries.reduce((acc, e) => acc + e.totalMembers, 0);
  const totalSafe = state.reports.filter(r => r.status === 'located_safe' || r.status === 'reunited').length;
  const criticalCases = state.reports.filter(r => r.priority === 'P0');

  const filteredReports = state.reports.filter(r =>
    r.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (r.groupName && r.groupName.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const priorityQueue = [...state.reports].sort((a, b) => b.priorityScore - a.priorityScore);

  const handleRunFaceMatch = () => {
    setFaceSearching(true);
    setTimeout(() => {
      const results = matchPatientPhoto('sample_unconscious_victim.jpg', state.reports);
      setFaceResults(results);
      setFaceSearching(false);
    }, 350);
  };

  const handleVerifySafe = async (reportId: string, location: string) => {
    const officerSignature = user ? `${user.rank} ${user.name}` : 'Commandant S. Rawat (8th Bn NDRF)';
    try {
      await fetch('/api/verify-safe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, location })
      });
    } catch (e) {
      console.warn('Verify-safe API call failed:', e);
    }
    sahayataStore.updateReportStatus(
      reportId,
      'located_safe',
      location,
      officerSignature
    );
    setVerifyModalReport(null);
  };

  const handleDispatch = async (reportId: string, unitId: string) => {
    try {
      await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, unitId })
      });
    } catch (e) {
      console.warn('Dispatch API call failed:', e);
    }
    sahayataStore.assignNDRFUnit(reportId, unitId);
    setAssignModalReport(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(0,26,16,0.08)] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-[11px] font-medium text-[#001A10] bg-[#A9F1CA] px-2.5 py-0.5 rounded-[9999px] border border-[rgba(0,26,16,0.08)]">
              ACTIVE HADR OPERATION
            </span>
            <span className="text-xs font-mono text-[#001A10]/60">
              {state.incident.id}
            </span>
            {isAuthenticated ? (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#00482F] bg-[#3ECF8E]/20 px-2 py-0.5 rounded-[6px] border border-[#3ECF8E]/40">
                <Shield className="h-3 w-3 text-[#00A85A]" />
                Clearance: {user?.name || '8th Bn Commander'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#001A10]/60 bg-[#F8F3EF] px-2 py-0.5 rounded-[6px] border border-[rgba(0,26,16,0.1)]">
                <Lock className="h-3 w-3 text-[#00A85A]" />
                Public Situational Awareness Mode
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#001A10] tracking-normal">
            {state.incident.name}
          </h1>
          <p className="text-sm font-[450] text-[#001A10]/70 mt-1">
            Real-time geospatial reconciliation, group inference, and victim tracing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <button
              onClick={openClearanceModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] border border-[#6DD9A8] bg-white hover:bg-[#A9F1CA]/20 text-[#00482F] text-xs font-medium transition-all shadow-sm"
            >
              <Shield className="h-3.5 w-3.5 text-[#00A85A]" />
              <span>NDRF Officer Login</span>
            </button>
          )}
          <button
            onClick={() => alert('Exporting official SITREP for National Disaster Management Authority...')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] border border-[#001A10] bg-transparent text-[#001A10] text-sm font-medium hover:bg-[#001A10]/5 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export SITREP</span>
          </button>
        </div>
      </div>

      {/* Public Awareness Ribbon (Rendered when unauthenticated) */}
      {!isAuthenticated && (
        <div className="rounded-[10px] border border-[rgba(0,26,16,0.1)] bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[8px] bg-[#3ECF8E]/20 text-[#00482F] flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-[#00A85A]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#001A10] flex items-center gap-2">
                <span>Public Situational Awareness Mode</span>
                <span className="font-mono text-[10px] bg-[#A9F1CA] text-[#00482F] px-1.5 py-0.5 rounded-[4px] font-bold">
                  READ-ONLY TELEMETRY
                </span>
              </div>
              <p className="text-xs text-[#001A10]/70 mt-0.5">
                Civilian visitors can observe live hazard maps and rescue shelter metrics. Official military QRT dispatch is restricted to authorized NDRF commanders.
              </p>
            </div>
          </div>
          <button
            onClick={openClearanceModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#3ECF8E] text-[#001A10] font-semibold text-xs hover:bg-[#6DD9A8] transition-all whitespace-nowrap shadow-none"
          >
            <span>Authenticate Officer Clearance</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. Supabase 4-Metric Grid (Cards: warm surface, 1px hairline, 12px radius, 0 shadow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#001A10]/70 uppercase tracking-normal">
            <span>Manifest Entrants</span>
            <Compass className="h-4 w-4 text-[#00A85A]" />
          </div>
          <div className="font-display text-3xl font-semibold text-[#001A10]" suppressHydrationWarning>
            {totalEntrants}
          </div>
          <p className="text-xs text-[#001A10]/60 font-[450]">
            Pre-registered at Tatopani Gate B
          </p>
        </div>

        <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#001A10]/70 uppercase tracking-normal">
            <span>Confirmed Safe / Exited</span>
            <CheckCircle2 className="h-4 w-4 text-[#3ECF8E]" />
          </div>
          <div className="font-display text-3xl font-semibold text-[#00A85A]" suppressHydrationWarning>
            {totalSafe}
          </div>
          <p className="text-xs text-[#001A10]/60 font-[450]">
            Verified across border relief shelters
          </p>
        </div>

        <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#001A10]/70 uppercase tracking-normal">
            <span>Unaccounted in Zone</span>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="font-display text-3xl font-semibold text-rose-700" suppressHydrationWarning>
            {totalEntrants - totalSafe}
          </div>
          <p className="text-xs text-[#001A10]/60 font-[450]">
            Active search sectors deployed
          </p>
        </div>

        <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#001A10]/70 uppercase tracking-normal">
            <span>Critical P0 Triage</span>
            <HeartPulse className="h-4 w-4 text-amber-600" />
          </div>
          <div className="font-display text-3xl font-semibold text-amber-700" suppressHydrationWarning>
            {criticalCases.length}
          </div>
          <p className="text-xs text-[#001A10]/60 font-[450]">
            High-urgency medical & hazard leads
          </p>
        </div>
      </div>

      {/* 3. Segmented Tab Strip */}
      <div className="inline-flex h-[38px] items-center rounded-[8px] border border-[rgba(0,26,16,0.08)] bg-white p-1 text-[#001A10] text-xs font-medium overflow-x-auto no-scrollbar max-w-full">
        {[
          { id: 'map', label: 'Overview & GIS Map', icon: Layers },
          { id: 'priority', label: 'Urgency Triage (P0-P3)', icon: AlertCircle },
          { id: 'groups', label: 'Reconstructed Groups', icon: Users },
          { id: 'registry', label: 'Victim Registry', icon: Search },
          { id: 'face', label: 'Hospital Face Matcher', icon: Camera }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-[6px] px-3.5 py-1 text-xs transition-all ${
                isActive
                  ? 'bg-[#3ECF8E] text-[#001A10] font-semibold'
                  : 'text-[#001A10]/70 hover:text-[#001A10]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: GIS MAP ================= */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[540px]">
            <IncidentMap
              center={state.incident.center}
              hazardPolygon={state.incident.hazardPolygon}
              reports={state.reports}
              infrastructure={state.infrastructure}
              ndrfUnits={state.ndrfUnits}
              onSelectReport={rep => setSelectedReport(rep)}
            />
          </div>

          {/* Right Lead Inspector */}
          <div className="space-y-4">
            {selectedReport ? (
              <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-[#001A10]/60">
                      {selectedReport.id}
                    </span>
                    <h3 className="font-display text-lg font-semibold text-[#001A10]">
                      {selectedReport.fullName}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-[9999px] text-[11px] font-mono font-medium ${
                    selectedReport.priority === 'P0'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-[#95E6B8] text-[#001A10]'
                  }`}>
                    {selectedReport.priority}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#001A10]/70 divide-y divide-[rgba(0,26,16,0.06)]">
                  <div className="pt-1">
                    <span className="font-medium text-[#001A10]">Last Known Location:</span> {selectedReport.lastKnownLocation}
                  </div>
                  <div className="pt-1">
                    <span className="font-medium text-[#001A10]">Associated Group:</span> {selectedReport.groupName || 'Solo Traveler'}
                  </div>
                  {selectedReport.medicalConditions && (
                    <div className="pt-1 text-rose-800 font-medium">
                      Medical Alert: {selectedReport.medicalConditions}
                    </div>
                  )}
                  <div className="pt-1">
                    <span className="font-medium text-[#001A10]">Reporter:</span> {selectedReport.reporterName} ({selectedReport.reporterRelationship})
                  </div>
                  {selectedReport.attachedDocument && (
                    <div className="pt-2 bg-[#A9F1CA]/20 p-2.5 rounded-[6px] border border-[#6DD9A8] text-[#00482F]">
                      <div className="flex items-center justify-between font-mono text-[10px] font-bold">
                        <span>VERIFIED DOCUMENT ATTACHED</span>
                        <span>{selectedReport.attachedDocument.confidenceScore}% MATCH</span>
                      </div>
                      <div className="font-semibold text-xs mt-0.5 text-[#001A10]">
                        {selectedReport.attachedDocument.documentType} ({selectedReport.attachedDocument.documentNumberMasked})
                      </div>
                      {selectedReport.attachedDocument.seatOrRoom && (
                        <div className="text-[11px] text-[#001A10]/70">
                          Seat / Room: {selectedReport.attachedDocument.seatOrRoom}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        openClearanceModal('Officer authentication required to dispatch field rescue units.');
                        return;
                      }
                      setAssignModalReport(selectedReport);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-medium text-xs hover:bg-[#6DD9A8] transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Dispatch NDRF Team</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        openClearanceModal('Officer authentication required to verify survivor status.');
                        return;
                      }
                      setVerifyModalReport(selectedReport);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[8px] border border-[#001A10] bg-transparent text-[#001A10] font-medium text-xs hover:bg-[#001A10]/5 transition-colors"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-[#00A85A]" />
                    <span>Confirm Located Safe</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-[#001A10] flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-rose-600" />
                    <span>Urgent Priority Leads (P0)</span>
                  </h3>
                  <span className="font-mono text-xs text-[#001A10]/60">
                    {criticalCases.length} Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {criticalCases.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedReport(item)}
                      className="p-3 rounded-[8px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF]/60 hover:bg-[#A9F1CA]/20 cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#001A10] text-xs">
                          {item.fullName} ({item.approxAge}y)
                        </span>
                        <span className="font-mono text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded-[9999px]">
                          Score {item.priorityScore}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#001A10]/70">
                        {item.medicalConditions || item.lastKnownLocation}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-[#001A10]/50 text-center pt-2 border-t border-[rgba(0,26,16,0.06)] font-mono">
                  Select any map pin to inspect case dossier.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: PRIORITY QUEUE ================= */}
      {activeTab === 'priority' && (
        <div className="space-y-4">
          <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6">
            <h2 className="font-display text-base font-semibold text-[#001A10]">
              Deterministic Priority Triage Queue (P0 - P3)
            </h2>
            <p className="text-xs text-[#001A10]/70 mt-0.5 font-[450]">
              Urgency over submission order: evaluates medical conditions, entrapment status, dynamic hazard boundaries, and age vulnerability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priorityQueue.map(rep => (
              <div
                key={rep.id}
                className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#001A10]/60">{rep.id}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[9999px] text-[10px] font-mono font-medium ${
                        rep.priority === 'P0'
                          ? 'bg-rose-100 text-rose-800'
                          : rep.priority === 'P1'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#95E6B8] text-[#001A10]'
                      }`}>
                        {rep.priority} (Score {rep.priorityScore}/100)
                      </span>
                    </div>
                    <h3 className="font-display text-base font-semibold text-[#001A10] mt-1">
                      {rep.fullName} ({rep.approxAge}y)
                    </h3>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[9999px] text-[11px] font-medium bg-[#F8F3EF] border border-[rgba(0,26,16,0.08)] text-[#001A10]">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      rep.status === 'located_safe' ? 'bg-[#00A85A]' : 'bg-amber-500'
                    }`} />
                    {rep.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#001A10]/60">
                    Urgency Criteria:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rep.priorityFactors.map((factor, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium border ${
                          factor.critical
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-[#F8F3EF] text-[#001A10]/70 border-[rgba(0,26,16,0.08)]'
                        }`}
                      >
                        {factor.label} (+{factor.weight})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-[#001A10]/70 space-y-0.5 border-t border-[rgba(0,26,16,0.06)] pt-2">
                  <div><strong className="text-[#001A10]">Location:</strong> {rep.lastKnownLocation}</div>
                  <div><strong className="text-[#001A10]">Group:</strong> {rep.groupName || 'Solo'}</div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        openClearanceModal('Officer authentication required to dispatch field rescue units.');
                        return;
                      }
                      setAssignModalReport(rep);
                    }}
                    className="flex-1 py-2 px-3 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-medium text-xs hover:bg-[#6DD9A8] transition-colors"
                  >
                    Dispatch Team
                  </button>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        openClearanceModal('Officer authentication required to verify survivor status.');
                        return;
                      }
                      setVerifyModalReport(rep);
                    }}
                    className="flex-1 py-2 px-3 rounded-[8px] border border-[#001A10] bg-transparent text-[#001A10] font-medium text-xs hover:bg-[#001A10]/5 transition-colors"
                  >
                    Mark Verified Safe
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: GROUP RECONSTRUCTION ================= */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[9999px] text-[10px] font-mono font-medium uppercase text-[#00482F] bg-[#A9F1CA]">
              Graph Entity Resolution
            </div>
            <h2 className="font-display text-base font-semibold text-[#001A10] mt-2">
              AI-Assisted Co-Traveler Group Reconstruction
            </h2>
            <p className="text-xs text-[#001A10]/70 mt-0.5 font-[450]">
              Unifies fragmented reports into shared manifests using permits, tour operators, transit vehicles, and temporal-spatial logs.
            </p>
          </div>

          {state.groups.map(group => (
            <div key={group.id} className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[rgba(0,26,16,0.08)] pb-4">
                <div>
                  <span className="font-mono text-xs text-[#001A10]/60 uppercase">
                    Permit: {group.permitNumber}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-[#001A10] mt-0.5">
                    {group.name}
                  </h3>
                  <div className="text-xs text-[#001A10]/70 mt-0.5">
                    Operator: <strong className="text-[#001A10]">{group.tourOperator}</strong> • Coach: <strong className="text-[#001A10]">{group.vehicleNumber}</strong>
                  </div>
                </div>

                <div className="flex gap-2 text-center font-mono">
                  <div className="bg-[#F8F3EF] px-3 py-1.5 rounded-[8px] border border-[rgba(0,26,16,0.08)]">
                    <div className="text-sm font-bold text-[#001A10]">{group.totalMembers}</div>
                    <div className="text-[10px] text-[#001A10]/60">Manifest</div>
                  </div>
                  <div className="bg-[#A9F1CA]/30 px-3 py-1.5 rounded-[8px] border border-[#6DD9A8] text-[#00482F]">
                    <div className="text-sm font-bold">{group.safeCount}</div>
                    <div className="text-[10px]">Verified Safe</div>
                  </div>
                  <div className="bg-rose-50 px-3 py-1.5 rounded-[8px] border border-rose-200 text-rose-800">
                    <div className="text-sm font-bold">{group.totalMembers - group.safeCount}</div>
                    <div className="text-[10px]">Unaccounted</div>
                  </div>
                </div>
              </div>

              {/* Explainability Box */}
              <div className="bg-[#F8F3EF] border border-[rgba(0,26,16,0.08)] rounded-[8px] p-4 space-y-1">
                <span className="text-[10px] font-mono text-[#001A10] uppercase tracking-normal">
                  Explainable Association Linkage:
                </span>
                <ul className="text-xs text-[#001A10]/80 space-y-1 list-disc list-inside">
                  {group.explainability.map((exp, idx) => (
                    <li key={idx}>{exp}</li>
                  ))}
                </ul>
              </div>

              {/* Member Grid */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-[#001A10]/70 uppercase tracking-normal">
                  Linked Pilgrims ({group.members.length} / {group.totalMembers} identified):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {group.members.map(member => (
                    <div
                      key={member.reportId}
                      className="p-3 rounded-[8px] border border-[rgba(0,26,16,0.08)] bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-medium text-[#001A10]">{member.fullName}</div>
                        {member.medicalAlert && (
                          <div className="text-[10px] text-rose-600 font-medium">{member.medicalAlert}</div>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[9999px] text-[10px] font-medium uppercase ${
                        member.status === 'located_safe' ? 'bg-[#95E6B8] text-[#001A10]' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {member.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB 4: VICTIM REGISTRY ================= */}
      {activeTab === 'registry' && (
        <div className="space-y-4">
          <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="h-4 w-4 text-[#001A10]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Filter by name, Case ID, or tour group..."
                className="w-full pl-9 pr-4 py-2 border border-[rgba(0,26,16,0.08)] rounded-[8px] text-xs font-[450] bg-[#F8F3EF] text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
            <div className="text-xs font-mono text-[#001A10]/60 whitespace-nowrap">
              {filteredReports.length} records matching criteria
            </div>
          </div>

          <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F3EF] border-b border-[rgba(0,26,16,0.08)] text-[#001A10]/70 font-mono uppercase tracking-normal">
                  <tr>
                    <th className="h-10 px-4">Case ID</th>
                    <th className="h-10 px-4">Full Name</th>
                    <th className="h-10 px-4">Priority</th>
                    <th className="h-10 px-4">Last Seen Location</th>
                    <th className="h-10 px-4">Status</th>
                    <th className="h-10 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(0,26,16,0.06)]">
                  {filteredReports.map(report => (
                    <tr key={report.id} className="hover:bg-[#F8F3EF]/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-[#001A10]">{report.id}</td>
                      <td className="px-4 py-3 font-medium text-[#001A10]">
                        <div className="flex items-center gap-1.5">
                          <span>{report.fullName}</span>
                          {report.attachedDocument && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[#A9F1CA] text-[#00482F] font-bold">
                              DOC VERIFIED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-[9999px] text-[10px] font-mono font-medium ${
                          report.priority === 'P0' ? 'bg-rose-50 text-rose-700' : 'bg-[#95E6B8] text-[#001A10]'
                        }`}>
                          {report.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#001A10]/70">{report.lastKnownLocation}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[9999px] text-[10px] font-medium uppercase ${
                          report.status === 'located_safe' ? 'bg-[#95E6B8] text-[#001A10]' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {report.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              openClearanceModal('Officer authentication required to verify survivor status.');
                              return;
                            }
                            setVerifyModalReport(report);
                          }}
                          className="px-2.5 py-1 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-transparent hover:bg-[#001A10]/5 text-[#001A10] font-medium text-[11px]"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              openClearanceModal('Officer authentication required to dispatch field rescue units.');
                              return;
                            }
                            setAssignModalReport(report);
                          }}
                          className="px-2.5 py-1 rounded-[6px] bg-[#3ECF8E] hover:bg-[#6DD9A8] text-[#001A10] font-medium text-[11px]"
                        >
                          Dispatch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: FACE MATCHER ================= */}
      {activeTab === 'face' && (
        <div className="space-y-4">
          <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[9999px] text-[10px] font-mono font-medium uppercase text-[#00482F] bg-[#A9F1CA]">
              AI Vision Embedding Matcher
            </div>
            <h2 className="font-display text-base font-semibold text-[#001A10] mt-2">
              Field Hospital Unconscious Survivor Matcher
            </h2>
            <p className="text-xs text-[#001A10]/70 mt-0.5 font-[450]">
              When an unconscious survivor or separated child arrives at a relief facility with no ID, upload their photo to compare 512-d embeddings against missing reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-4 text-center">
              <div className="h-16 w-16 rounded-full bg-[#F8F3EF] text-[#001A10] flex items-center justify-center mx-auto border border-[rgba(0,26,16,0.08)]">
                <Camera className="h-7 w-7 text-[#00A85A]" />
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold text-[#001A10]">Patient Photo Stream</h4>
                <p className="text-xs text-[#001A10]/60 mt-0.5">
                  Tatopani Field Trauma Ward (Patient #T-094)
                </p>
              </div>

              <button
                onClick={handleRunFaceMatch}
                disabled={faceSearching}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-medium text-xs hover:bg-[#6DD9A8] transition-colors disabled:opacity-50"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>{faceSearching ? 'Computing Cosine Distance...' : 'Analyze & Match Patient Photo'}</span>
              </button>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="text-xs font-mono text-[#001A10]/70 uppercase tracking-normal">
                Candidate Matches (Similarity &gt; 0.68):
              </div>

              {faceResults.length > 0 ? (
                faceResults.map((match, idx) => (
                  <div
                    key={idx}
                    className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-5 flex flex-col sm:flex-row items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#00A85A] bg-[#A9F1CA]/30 px-2 py-0.5 rounded-[9999px]">
                          {match.confidencePercentage}% Match Confidence
                        </span>
                        <span className="font-mono text-[10px] text-[#001A10]/60">
                          {match.report.id}
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-semibold text-[#001A10]">
                        {match.report.fullName} ({match.report.approxAge}y)
                      </h4>
                      <ul className="text-xs text-[#001A10]/70 space-y-0.5 list-disc list-inside">
                        {match.matchRationale.map((rat, rIdx) => (
                          <li key={rIdx}>{rat}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          openClearanceModal('Officer authentication required to verify survivor status.');
                          return;
                        }
                        handleVerifySafe(match.report.id, 'Tatopani Field Hospital - Ward A');
                      }}
                      className="px-4 py-2 rounded-[8px] bg-[#001A10] text-white text-xs font-medium hover:bg-[#001A10]/90 transition-colors whitespace-nowrap"
                    >
                      Verify Identity & Mark Safe
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-[12px] border border-dashed border-[rgba(0,26,16,0.12)] bg-[#F8F3EF]/50 p-8 text-center text-xs text-[#001A10]/60">
                  Tap "Analyze & Match Patient Photo" to execute vector feature comparison against the missing registry.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Assign NDRF Unit */}
      {assignModalReport && (
        <div className="fixed inset-0 z-50 bg-[#001A10]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white max-w-md w-full p-6 space-y-4 shadow-overlay">
            <h3 className="font-display text-base font-semibold text-[#001A10]">
              Dispatch NDRF Team for {assignModalReport.fullName}
            </h3>
            <p className="text-xs text-[#001A10]/70">
              Select an available battalion quick reaction team:
            </p>

            <div className="space-y-2">
              {state.ndrfUnits.map(unit => (
                <div
                  key={unit.id}
                  onClick={() => handleDispatch(assignModalReport.id, unit.id)}
                  className="p-3 rounded-[8px] border border-[rgba(0,26,16,0.08)] hover:border-[#3ECF8E] bg-[#F8F3EF] hover:bg-[#A9F1CA]/20 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#001A10] text-xs">{unit.callsign}</span>
                    <span className="text-[11px] font-mono text-[#00A85A]">{unit.distanceKm} km away</span>
                  </div>
                  <div className="text-[11px] text-[#001A10]/60 mt-0.5">
                    Equipment: {unit.equipment.join(', ')}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setAssignModalReport(null)}
              className="w-full py-2 rounded-[8px] border border-[#001A10] bg-transparent text-[#001A10] text-xs font-medium hover:bg-[#001A10]/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: Verify Sighting & Mark Safe */}
      {verifyModalReport && (
        <div className="fixed inset-0 z-50 bg-[#001A10]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white max-w-md w-full p-6 space-y-4 shadow-overlay">
            <h3 className="font-display text-base font-semibold text-[#001A10]">
              Confirm Survivor Location for {verifyModalReport.fullName}
            </h3>
            <p className="text-xs text-[#001A10]/70">
              Updates case status to LOCATED SAFE and immediately informs the family portal.
            </p>

            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">
                Relief Camp or Hospital Facility
              </label>
              <input
                type="text"
                id="safeLocInput"
                defaultValue="Kodari Border Relief Camp 3"
                className="w-full border border-[rgba(0,26,16,0.08)] rounded-[8px] p-2.5 text-xs text-[#001A10] bg-[#F8F3EF] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const input = (document.getElementById('safeLocInput') as HTMLInputElement)?.value;
                  handleVerifySafe(verifyModalReport.id, input || 'Kodari Border Relief Camp 3');
                }}
                className="flex-1 py-2 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-medium text-xs hover:bg-[#6DD9A8] transition-colors"
              >
                Confirm Located Safe
              </button>
              <button
                onClick={() => setVerifyModalReport(null)}
                className="py-2 px-3 rounded-[8px] border border-[#001A10] bg-transparent text-[#001A10] text-xs font-medium hover:bg-[#001A10]/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
