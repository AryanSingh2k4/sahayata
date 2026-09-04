'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Compass,
  Shield,
  QrCode,
  Users,
  Printer
} from 'lucide-react';
import { sahayataStore } from '@/lib/store';
import { PreDisasterEntry } from '@/lib/types';

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
    membersText: 'Dr. Milind Chitley\nDr. Janhavi Chitley\nSomnath Joshi\nRadha Joshi\nSunil Gavaskar\nMeena Deshmukh\nGanesh Hegde'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const membersList = formData.membersText
      .split('\n')
      .map(m => m.trim())
      .filter(Boolean);

    const entry = sahayataStore.addPreDisasterEntry({
      groupName: formData.groupName,
      groupType: formData.groupType,
      leaderName: formData.leaderName,
      leaderPhone: formData.leaderPhone,
      totalMembers: Number(formData.totalMembers),
      permitNumber: formData.permitNumber,
      vehicleNumber: formData.vehicleNumber,
      entryCheckpoint: formData.entryCheckpoint,
      exitCheckpoint: formData.exitCheckpoint,
      expectedExitTime: formData.expectedExitTime,
      members: membersList
    });

    setCreatedEntry(entry);
  };

  const handlePrint = () => {
    window.print();
  };

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
        <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 sm:p-8 space-y-6">
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

          {/* ID Card Representation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-[8px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] p-5">
            <div className="flex flex-col items-center justify-center p-4 bg-white border border-[rgba(0,26,16,0.08)] rounded-[8px] text-center">
              <div className="w-32 h-32 bg-[#001A10] text-[#3ECF8E] p-2 rounded-[6px] flex items-center justify-center">
                <QrCode className="w-24 h-24" />
              </div>
              <span className="font-mono text-xs font-bold text-[#001A10] mt-2">
                {createdEntry.id}
              </span>
              <span className="text-[10px] font-mono text-[#001A10]/60">
                Offline Scanner Key
              </span>
            </div>

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
        <form onSubmit={handleSubmit} className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 sm:p-8 space-y-5">
          <div className="border-b border-[rgba(0,26,16,0.08)] pb-3">
            <h2 className="font-display text-base font-semibold text-[#001A10]">Trip & Group Manifest Declaration</h2>
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

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-medium text-xs hover:bg-[#6DD9A8] transition-colors"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Generate Official QR Emergency ID Cards</span>
          </button>
        </form>
      )}
    </div>
  );
}
