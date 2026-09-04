'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Shield,
  AlertTriangle,
  MapPin,
  Users,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  RadioTower,
  Siren,
  ClipboardCheck,
  ChevronRight,
  Car
} from 'lucide-react';
import { sahayataStore } from '@/lib/store';
import { PreDisasterEntry } from '@/lib/types';

const HAZARD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Flash Flood': { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  'Landslide':   { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  'Avalanche':   { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  'Cloudburst':  { bg: '#CCFBF1', text: '#0F766E', border: '#5EEAD4' },
};

const DANGER_ZONE_HAZARD: Record<string, string> = {
  'Bhotekoshi River Gorge':    'Flash Flood',
  'Tatopani Flood Plain':       'Flash Flood',
  'Kodari Landslide Corridor':  'Landslide',
  'Liping Bridge Approach':     'Landslide',
  'Barhabise Flood Zone':       'Flash Flood',
  'Kailash High Altitude Pass': 'Avalanche',
  'Sindhupalchok Debris Field': 'Landslide',
  'Dhunche Cloudburst Zone':    'Cloudburst',
};

type GroupStatus = 'inside_zone' | 'exited' | 'overdue';

const STATUS_META: Record<GroupStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  inside_zone: {
    label: 'Inside Zone — Active',
    color: '#1E40AF',
    bg: '#DBEAFE',
    icon: <RadioTower className="h-4 w-4" />,
  },
  exited: {
    label: 'Safely Exited',
    color: '#166534',
    bg: '#DCFCE7',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  overdue: {
    label: 'OVERDUE — Not Exited',
    color: '#991B1B',
    bg: '#FEE2E2',
    icon: <Siren className="h-4 w-4" />,
  },
};

export default function ScanPage() {
  const params = useParams();
  const entryId = params.id as string;
  const locale  = params.locale as string;

  const [entry, setEntry]       = useState<PreDisasterEntry | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updated, setUpdated]   = useState(false);
  const [scanTime]              = useState(new Date());

  useEffect(() => {
    const load = async () => {
      // 1. Try Supabase first (works on any device)
      try {
        const { supabase } = await import('@/lib/supabaseClient');
        const { data, error } = await supabase
          .from('pre_disaster_entries')
          .select('*')
          .eq('id', entryId)
          .single();

        if (data && !error) {
          // Map snake_case columns → camelCase PreDisasterEntry
          setEntry({
            id:                data.id,
            groupName:         data.group_name,
            groupType:         data.group_type,
            leaderName:        data.leader_name,
            leaderPhone:       data.leader_phone,
            totalMembers:      data.total_members,
            permitNumber:      data.permit_number,
            vehicleNumber:     data.vehicle_number,
            entryCheckpoint:   data.entry_checkpoint,
            exitCheckpoint:    data.exit_checkpoint,
            entryTime:         data.entry_time,
            expectedExitTime:  data.expected_exit_time,
            actualExitTime:    data.actual_exit_time,
            status:            data.status,
            members:           data.members ?? [],
            dangerZones:       data.danger_zones ?? [],
          });
          return;
        }
      } catch (e) {
        console.warn('Supabase fetch failed, trying local store:', e);
      }

      // 2. Fallback: local store (same device)
      sahayataStore.initClient();
      const state = sahayataStore.getState();
      const found = state.preDisasterEntries.find(e => e.id === entryId);
      if (found) {
        setEntry(found);
      } else {
        setNotFound(true);
      }
    };

    load();
  }, [entryId]);

  const markStatus = async (status: GroupStatus) => {
    if (!entry) return;
    setUpdating(true);

    // Update Supabase
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase
        .from('pre_disaster_entries')
        .update({
          status,
          actual_exit_time: status === 'exited' ? new Date().toISOString() : undefined,
        })
        .eq('id', entry.id);
    } catch (e) {
      console.warn('Supabase update failed:', e);
    }

    setEntry(prev => prev ? { ...prev, status, actualExitTime: status === 'exited' ? new Date().toISOString() : prev.actualExitTime } : prev);
    setTimeout(() => { setUpdating(false); setUpdated(true); }, 400);
  };

  const isOverdue = entry
    ? new Date() > new Date(entry.expectedExitTime) && entry.status !== 'exited'
    : false;

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 space-y-5">
        {/* Icon */}
        <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-7 w-7 text-amber-500" />
        </div>

        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="font-display text-xl font-semibold text-[#001A10]">Entry Not Available Here</h1>
          <p className="font-mono text-xs text-[#001A10]/50">{entryId}</p>
        </div>

        {/* Explanation card */}
        <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-5 space-y-3 text-sm">
          <p className="text-amber-800 font-medium">Why am I seeing this?</p>
          <p className="text-amber-700 text-xs leading-relaxed">
            This group was registered on a <strong>different device</strong>. The manifest is stored locally in that device's browser and hasn't synced to a shared server yet.
          </p>
          <div className="border-t border-amber-200 pt-3 text-xs text-amber-700 space-y-1">
            <p className="font-semibold">For the group leader / registering officer:</p>
            <p>Ask the person who submitted the QR to open the pre-disaster page on their device — the data is stored there.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link
            href={`/${locale}/dashboard`}
            className="w-full py-2.5 px-4 rounded-[8px] bg-[#001A10] text-[#3ECF8E] text-xs font-medium text-center hover:bg-[#002818] transition-colors"
          >
            Go to NDRF Dashboard
          </Link>
          <Link
            href={`/${locale}/pre-disaster`}
            className="w-full py-2.5 px-4 rounded-[8px] border border-[rgba(0,26,16,0.12)] text-[#001A10] text-xs font-medium text-center hover:bg-[#001A10]/5 transition-colors"
          >
            Register a New Group
          </Link>
        </div>
      </div>
    );
  }


  if (!entry) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 flex items-center justify-center">
        <div className="text-sm text-[#001A10]/50 font-mono animate-pulse">Loading manifest…</div>
      </div>
    );
  }

  const meta = STATUS_META[entry.status] ?? STATUS_META.inside_zone;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">

      {/* ── Authority header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-[8px] bg-[#001A10] text-[#3ECF8E] flex items-center justify-center shrink-0">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#001A10]/50 uppercase tracking-widest">NDRF Checkpoint Scan</p>
            <p className="font-display text-sm font-semibold text-[#001A10]">Group Manifest Verification</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] text-[#001A10]/50 uppercase">Scanned</p>
          <p className="font-mono text-xs text-[#001A10]">{scanTime.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* ── Overdue alert banner ── */}
      {isOverdue && (
        <div className="flex items-center gap-3 rounded-[8px] border border-red-300 bg-red-50 px-4 py-3">
          <Siren className="h-5 w-5 text-red-500 shrink-0 animate-pulse" />
          <div>
            <p className="text-sm font-semibold text-red-700">GROUP IS OVERDUE</p>
            <p className="text-xs text-red-600">Expected exit by {new Date(entry.expectedExitTime).toLocaleString()} — not yet recorded as exited.</p>
          </div>
        </div>
      )}

      {/* ── Group ID + status ── */}
      <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="font-mono text-[10px] text-[#001A10]/50 uppercase">Entry ID</p>
            <p className="font-mono text-lg font-bold text-[#001A10]">{entry.id}</p>
          </div>
          <span
            style={{ backgroundColor: meta.bg, color: meta.color }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-semibold"
          >
            {meta.icon}
            {meta.label}
          </span>
        </div>

        {/* Group info grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs border-t border-[rgba(0,26,16,0.06)] pt-4">
          <div>
            <p className="font-mono text-[10px] text-[#001A10]/50 uppercase mb-0.5">Tour / Group</p>
            <p className="font-semibold text-[#001A10]">{entry.groupName}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#001A10]/50 uppercase mb-0.5">Permit ID</p>
            <p className="font-mono font-bold text-[#001A10]">{entry.permitNumber}</p>
          </div>
          <div className="flex items-start gap-1.5">
            <Phone className="h-3.5 w-3.5 text-[#001A10]/40 mt-0.5 shrink-0" />
            <div>
              <p className="font-mono text-[10px] text-[#001A10]/50 uppercase mb-0.5">Group Leader</p>
              <p className="text-[#001A10] font-medium">{entry.leaderName}</p>
              <p className="font-mono text-[#001A10]/70">{entry.leaderPhone}</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <Car className="h-3.5 w-3.5 text-[#001A10]/40 mt-0.5 shrink-0" />
            <div>
              <p className="font-mono text-[10px] text-[#001A10]/50 uppercase mb-0.5">Vehicle</p>
              <p className="font-mono text-[#001A10]">{entry.vehicleNumber}</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#001A10]/40 mt-0.5 shrink-0" />
            <div>
              <p className="font-mono text-[10px] text-[#001A10]/50 uppercase mb-0.5">Entry Gate</p>
              <p className="text-[#001A10]">{entry.entryCheckpoint}</p>
              <p className="text-[#001A10]/60 text-[11px]">{new Date(entry.entryTime).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#001A10]/40 mt-0.5 shrink-0" />
            <div>
              <p className="font-mono text-[10px] text-[#001A10]/50 uppercase mb-0.5">Expected Exit</p>
              <p className={`text-[#001A10] ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                {new Date(entry.expectedExitTime).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="border-t border-[rgba(0,26,16,0.06)] pt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="h-3.5 w-3.5 text-[#001A10]/50" />
            <p className="font-mono text-[10px] text-[#001A10]/50 uppercase">
              Registered Members — {entry.totalMembers} Total Pax
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {entry.members.map((m, i) => (
              <span key={i} className="px-2 py-0.5 rounded-[4px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] text-[11px] text-[#001A10]">
                {m}
              </span>
            ))}
            {entry.totalMembers > entry.members.length && (
              <span className="px-2 py-0.5 rounded-[4px] bg-[#A9F1CA]/20 text-[#00482F] text-[11px] font-mono">
                +{entry.totalMembers - entry.members.length} more on manifest
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Danger zones ── */}
      {entry.dangerZones.length > 0 && (
        <div className="rounded-[12px] border border-red-200 bg-red-50 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">
              Declared Hazard Zone Entry — {entry.dangerZones.length} Zone{entry.dangerZones.length > 1 ? 's' : ''}
            </p>
          </div>
          <p className="text-[11px] text-red-600">
            This group declared entry into the following danger zones. Verify their safe return at exit checkpoint.
          </p>
          <div className="flex flex-wrap gap-2">
            {entry.dangerZones.map(zone => {
              const hazard = DANGER_ZONE_HAZARD[zone] ?? 'Hazard';
              const col = HAZARD_COLORS[hazard] ?? HAZARD_COLORS['Landslide'];
              return (
                <span
                  key={zone}
                  style={{ backgroundColor: col.bg, color: col.text, borderColor: col.border }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border text-[11px] font-medium"
                >
                  <MapPin className="h-3 w-3" />
                  {zone}
                  <span className="opacity-70">· {hazard}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Authority actions ── */}
      {!updated ? (
        <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="h-4 w-4 text-[#001A10]/60" />
            <p className="text-xs font-semibold text-[#001A10]">Update Group Status</p>
          </div>
          <p className="text-[11px] text-[#001A10]/60">
            Tap to record this group's current status in the NDRF registry.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Confirmed Safe Exit */}
            <button
              onClick={() => markStatus('exited')}
              disabled={updating || entry.status === 'exited'}
              className="flex items-center gap-2.5 px-4 py-3 rounded-[8px] border border-[#86EFAC] bg-[#F0FDF4] hover:bg-[#DCFCE7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-green-800">Confirm Safe Exit</p>
                <p className="text-[10px] text-green-600">All members accounted for</p>
              </div>
            </button>

            {/* Still inside */}
            <button
              onClick={() => markStatus('inside_zone')}
              disabled={updating || entry.status === 'inside_zone'}
              className="flex items-center gap-2.5 px-4 py-3 rounded-[8px] border border-[#93C5FD] bg-[#EFF6FF] hover:bg-[#DBEAFE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RadioTower className="h-4 w-4 text-blue-600 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-blue-800">Mark Active / Inside</p>
                <p className="text-[10px] text-blue-600">Group still in zone</p>
              </div>
            </button>

            {/* Flag overdue */}
            <button
              onClick={() => markStatus('overdue')}
              disabled={updating || entry.status === 'overdue'}
              className="flex items-center gap-2.5 px-4 py-3 rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] hover:bg-[#FEE2E2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Siren className="h-4 w-4 text-red-600 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-red-800">Flag Overdue</p>
                <p className="text-[10px] text-red-600">Trigger search protocol</p>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-[12px] border border-[#86EFAC] bg-[#F0FDF4] p-5 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Status Updated</p>
            <p className="text-xs text-green-600">
              Group <span className="font-mono font-bold">{entry.id}</span> marked as <span className="font-bold">{STATUS_META[entry.status]?.label}</span>
            </p>
          </div>
        </div>
      )}

      {/* ── Footer links ── */}
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <Link
          href={`/${locale}/dashboard`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[8px] bg-[#001A10] text-[#3ECF8E] text-xs font-medium hover:bg-[#002818] transition-colors"
        >
          <Shield className="h-3.5 w-3.5" />
          NDRF Incident Dashboard
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href={`/${locale}/pre-disaster`}
          className="py-2.5 px-4 rounded-[8px] border border-[rgba(0,26,16,0.12)] text-[#001A10] text-xs font-medium text-center hover:bg-[#001A10]/5 transition-colors"
        >
          Register New Group
        </Link>
      </div>

    </div>
  );
}
