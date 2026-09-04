'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Compass,
  Shield,
  Users,
  Printer,
  AlertTriangle,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { sahayataStore } from '@/lib/store';
import { PreDisasterEntry } from '@/lib/types';
import QRCode from 'qrcode';

// ─── Static Danger Zones for the Bhotekoshi / Himalayan Corridor ─────────────
const DANGER_ZONES = [
  { id: 'dz_bhotekoshi',   label: 'Bhotekoshi River Gorge',      hazard: 'Flash Flood',   color: 'blue'   },
  { id: 'dz_tatopani',     label: 'Tatopani Flood Plain',         hazard: 'Flash Flood',   color: 'blue'   },
  { id: 'dz_kodari',       label: 'Kodari Landslide Corridor',    hazard: 'Landslide',     color: 'orange' },
  { id: 'dz_liping',       label: 'Liping Bridge Approach',       hazard: 'Landslide',     color: 'orange' },
  { id: 'dz_barhabise',    label: 'Barhabise Flood Zone',         hazard: 'Flash Flood',   color: 'blue'   },
  { id: 'dz_kailash',      label: 'Kailash High Altitude Pass',   hazard: 'Avalanche',     color: 'purple' },
  { id: 'dz_sindhupalchok',label: 'Sindhupalchok Debris Field',   hazard: 'Landslide',     color: 'orange' },
  { id: 'dz_cloudburst',   label: 'Dhunche Cloudburst Zone',      hazard: 'Cloudburst',    color: 'teal'   },
];

const HAZARD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  orange: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  purple: { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  teal:   { bg: '#CCFBF1', text: '#0F766E', border: '#5EEAD4' },
};

interface PreDisasterProps {
  params: { locale: string };
}

export default function PreDisasterPage({ params: { locale } }: PreDisasterProps) {
  const t = useTranslations('preDisaster');
  const common = useTranslations('common');

  const [createdEntry, setCreatedEntry] = useState<PreDisasterEntry | null>(null);
  const [formData, setFormData] = useState({
    groupName: 'Pilgrim Trail Group 17 (Kailash Yatra)',
    groupType: 'pilgrimage',
    leaderName: 'Somnath Joshi',
    leaderPhone: '+91 98201 44521',
    totalMembers: 61,
    permitNumber: 'KY-2026-BH-991',
    vehicleNumber: 'UK-07-TA-4491',
    entryCheckpoint: 'Tatopani Gate B',
    exitCheckpoint: 'Kodari Border Post',
    expectedExitTime: '2026-08-28T18:00',
    membersText: 'Dr. Milind Chitley\nDr. Janhavi Chitley\nSomnath Joshi\nRadha Joshi\nSunil Gavaskar\nMeena Deshmukh\nGanesh Hegde',
    dangerZones: [] as string[],
  });

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate real QR code on canvas whenever the entry is created
  useEffect(() => {
    if (!createdEntry || !qrCanvasRef.current) return;

    // Encode as a full URL so scanning opens the NDRF authority page directly
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const scanUrl = `${origin}/${locale}/scan/${createdEntry.id}`;

    QRCode.toCanvas(qrCanvasRef.current, scanUrl, {
      width: 128,
      margin: 1,
      color: {
        dark:  '#3ECF8E',
        light: '#001A10',
      },
    });
  }, [createdEntry, locale]);

  const toggleDangerZone = (label: string) => {
    setFormData(prev => ({
      ...prev,
      dangerZones: prev.dangerZones.includes(label)
        ? prev.dangerZones.filter(z => z !== label)
        : [...prev.dangerZones, label],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const membersList = formData.membersText
      .split('\n')
      .map(m => m.trim())
      .filter(Boolean);

    const entry = await sahayataStore.addPreDisasterEntry({
      groupName:        formData.groupName,
      groupType:        formData.groupType,
      leaderName:       formData.leaderName,
      leaderPhone:      formData.leaderPhone,
      totalMembers:     Number(formData.totalMembers),
      permitNumber:     formData.permitNumber,
      vehicleNumber:    formData.vehicleNumber,
      entryCheckpoint:  formData.entryCheckpoint,
      exitCheckpoint:   formData.exitCheckpoint,
      expectedExitTime: formData.expectedExitTime,
      members:          membersList,
      dangerZones:      formData.dangerZones,
    });

    setCreatedEntry(entry);
  };

  const handlePrint = () => { window.print(); };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[9999px] bg-[#A9F1CA]/40 border border-[#6DD9A8] text-[#00482F] text-xs font-mono">
          <Compass className="h-3 w-3" />
          <span>Section 44 Disaster Management Act Mandate</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#001A10]">
          {t('title')}
        </h1>
        <p className="text-xs sm:text-sm text-[#001A10]/70 max-w-xl mx-auto font-[450]">
          {t('subtitle')}
        </p>
      </div>

      {createdEntry ? (
        /* ── Result Card ───────────────────────────────────────────────────── */
        <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 sm:p-8 space-y-6">
          {/* Card header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(0,26,16,0.08)] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-[8px] bg-[#001A10] text-[#3ECF8E] flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-[#001A10]/60 uppercase">
                  National Disaster Registry
                </span>
                <h2 className="font-display text-lg font-semibold text-[#001A10]">
                  {t('cardTitle')}
                </h2>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#3ECF8E] text-[#001A10] text-xs font-medium hover:bg-[#6DD9A8] transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Emergency ID Cards</span>
            </button>
          </div>

          {/* ── QR + data grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-[8px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] p-5">
            {/* QR canvas */}
            <div className="flex flex-col items-center justify-center p-4 bg-white border border-[rgba(0,26,16,0.08)] rounded-[8px] text-center">
              <div className="w-32 h-32 bg-[#001A10] rounded-[6px] flex items-center justify-center overflow-hidden">
                <canvas
                  ref={qrCanvasRef}
                  style={{ display: 'block', width: 128, height: 128 }}
                />
              </div>
              <span className="font-mono text-xs font-bold text-[#001A10] mt-2">
                {createdEntry.id}
              </span>
              <span className="text-[10px] font-mono text-[#001A10]/60">
                Offline Scanner Key
              </span>
            </div>

            {/* Data fields */}
            <div className="md:col-span-2 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-mono text-[#001A10]/60 uppercase text-[10px]">Tour / Group</span>
                  <div className="font-semibold text-[#001A10] text-sm">{createdEntry.groupName}</div>
                </div>
                <div>
                  <span className="font-mono text-[#001A10]/60 uppercase text-[10px]">Permit ID</span>
                  <div className="font-mono font-bold text-[#001A10] text-sm">{createdEntry.permitNumber}</div>
                </div>
                <div>
                  <span className="font-mono text-[#001A10]/60 uppercase text-[10px]">Group Leader</span>
                  <div className="text-[#001A10]">{createdEntry.leaderName} ({createdEntry.leaderPhone})</div>
                </div>
                <div>
                  <span className="font-mono text-[#001A10]/60 uppercase text-[10px]">Coach / Vehicle</span>
                  <div className="font-mono text-[#001A10]">{createdEntry.vehicleNumber}</div>
                </div>
                <div>
                  <span className="font-mono text-[#001A10]/60 uppercase text-[10px]">Entry Gate</span>
                  <div className="text-[#001A10]">{createdEntry.entryCheckpoint} ({new Date(createdEntry.entryTime).toLocaleTimeString()})</div>
                </div>
                <div>
                  <span className="font-mono text-[#001A10]/60 uppercase text-[10px]">Expected Return</span>
                  <div className="text-[#001A10]">{new Date(createdEntry.expectedExitTime).toLocaleString()}</div>
                </div>
              </div>

              {/* Members */}
              <div className="border-t border-[rgba(0,26,16,0.06)] pt-2 text-xs">
                <span className="font-mono text-[#001A10]/60 text-[10px] uppercase">
                  Registered Members ({createdEntry.totalMembers} Total Pax):
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {createdEntry.members.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-[4px] border border-[rgba(0,26,16,0.08)] bg-white text-[11px] text-[#001A10]">
                      {m}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#A9F1CA]/20 text-[#00482F] text-[11px] font-mono">
                    +{createdEntry.totalMembers - createdEntry.members.length} More
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Danger Zones declared ── */}
          {createdEntry.dangerZones.length > 0 && (
            <div className="rounded-[8px] border border-red-200 bg-red-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                  Declared Danger Zone Entry ({createdEntry.dangerZones.length} zone{createdEntry.dangerZones.length > 1 ? 's' : ''})
                </span>
              </div>
              <p className="text-[11px] text-red-600">
                This group has declared entry into the following hazard zones. Priority monitoring active.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {createdEntry.dangerZones.map(zone => {
                  const def = DANGER_ZONES.find(d => d.label === zone);
                  const col = def ? HAZARD_COLORS[def.color] : HAZARD_COLORS.orange;
                  return (
                    <span
                      key={zone}
                      style={{ backgroundColor: col.bg, color: col.text, borderColor: col.border }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] border text-[11px] font-medium"
                    >
                      <MapPin className="h-2.5 w-2.5" />
                      {zone}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/${locale}/dashboard`}
              className="flex-1 py-2 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-medium text-xs text-center hover:bg-[#6DD9A8] transition-colors"
            >
              View on NDRF Incident Dashboard &rarr;
            </Link>
            <button
              onClick={() => setCreatedEntry(null)}
              className="py-2 px-4 rounded-[8px] border border-[#001A10] bg-transparent text-[#001A10] font-medium text-xs hover:bg-[#001A10]/5 transition-colors"
            >
              Register Another Group
            </button>
          </div>
        </div>
      ) : (
        /* ── Registration Form ─────────────────────────────────────────────── */
        <form onSubmit={handleSubmit} className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 sm:p-8 space-y-5">
          <div className="border-b border-[rgba(0,26,16,0.08)] pb-3">
            <h2 className="font-display text-base font-semibold text-[#001A10]">Trip &amp; Group Manifest Declaration</h2>
            <p className="text-xs text-[#001A10]/70 font-[450]">
              Mandatory under Kangra and Himalayan Disaster Management regulations before passing Tatopani Gate B.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">
                Tour / Group Name *
              </label>
              <input
                type="text"
                required
                value={formData.groupName}
                onChange={e => setFormData({ ...formData, groupName: e.target.value })}
                className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">
                Permit / Yatra Registration ID *
              </label>
              <input
                type="text"
                required
                value={formData.permitNumber}
                onChange={e => setFormData({ ...formData, permitNumber: e.target.value })}
                className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs font-mono text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">
                {t('groupLeader')} *
              </label>
              <input
                type="text"
                required
                value={formData.leaderName}
                onChange={e => setFormData({ ...formData, leaderName: e.target.value })}
                className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">
                {t('leaderPhone')} *
              </label>
              <input
                type="tel"
                required
                value={formData.leaderPhone}
                onChange={e => setFormData({ ...formData, leaderPhone: e.target.value })}
                className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs font-mono text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">
                {t('totalMembers')} *
              </label>
              <input
                type="number"
                required
                value={formData.totalMembers}
                onChange={e => setFormData({ ...formData, totalMembers: Number(e.target.value) })}
                className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">
                Vehicle / Bus Number
              </label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs font-mono text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">
                {t('entryCheckpoint')}
              </label>
              <input
                type="text"
                value={formData.entryCheckpoint}
                onChange={e => setFormData({ ...formData, entryCheckpoint: e.target.value })}
                className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">
                {t('expectedExitTime')}
              </label>
              <input
                type="datetime-local"
                value={formData.expectedExitTime}
                onChange={e => setFormData({ ...formData, expectedExitTime: e.target.value })}
                className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#001A10] mb-1">
              Member Names (One per line)
            </label>
            <textarea
              rows={3}
              value={formData.membersText}
              onChange={e => setFormData({ ...formData, membersText: e.target.value })}
              className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] p-2.5 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>

          {/* ── Danger Zone Selection ── */}
          <div className="rounded-[8px] border border-orange-200 bg-orange-50 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-orange-800">Hazard Zone Declaration</p>
                <p className="text-[11px] text-orange-600 mt-0.5">
                  Select all danger zones your group will enter. Your group will be flagged for priority monitoring by NDRF teams.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DANGER_ZONES.map(zone => {
                const checked = formData.dangerZones.includes(zone.label);
                const col = HAZARD_COLORS[zone.color];
                return (
                  <label
                    key={zone.id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] border cursor-pointer transition-all ${
                      checked
                        ? 'border-orange-400 bg-orange-100'
                        : 'border-[rgba(0,26,16,0.08)] bg-white hover:bg-orange-50/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDangerZone(zone.label)}
                      className="sr-only"
                    />
                    <div className={`h-4 w-4 rounded-[3px] border flex items-center justify-center shrink-0 transition-all ${
                      checked ? 'bg-orange-500 border-orange-500' : 'border-[rgba(0,26,16,0.2)] bg-white'
                    }`}>
                      {checked && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-[#001A10] font-medium leading-tight block truncate">
                        {zone.label}
                      </span>
                      <span
                        style={{ backgroundColor: col.bg, color: col.text, borderColor: col.border }}
                        className="inline-block border rounded-[3px] px-1.5 py-px text-[10px] font-mono mt-0.5"
                      >
                        {zone.hazard}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {formData.dangerZones.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-orange-700 font-medium">
                <MapPin className="h-3 w-3" />
                {formData.dangerZones.length} zone{formData.dangerZones.length > 1 ? 's' : ''} selected — NDRF priority flag will be set
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-medium text-xs hover:bg-[#6DD9A8] transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Generate Official QR Emergency ID Card</span>
          </button>
        </form>
      )}
    </div>
  );
}
