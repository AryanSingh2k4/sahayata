'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Radio,
  Wifi,
  WifiOff,
  UserPlus,
  Eye,
  QrCode,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { sahayataStore } from '@/lib/store';
import { offlineDb } from '@/lib/offline/dexieDb';
import { useLiveQuery } from 'dexie-react-hooks';

interface FieldPageProps {
  params: { locale: string };
}

export default function FieldTeamPage({ params: { locale } }: FieldPageProps) {
  const t = useTranslations('field');
  const common = useTranslations('common');

  const [isOnline, setIsOnline] = useState(false);
  const [activeForm, setActiveForm] = useState<'none' | 'register' | 'sighting' | 'qr'>('none');
  const [isSyncing, setIsSyncing] = useState(false);

  // Live queries from Dexie.js
  const offlinePersons = useLiveQuery(() => offlineDb.offlinePersons.toArray(), []) || [];
  const offlineSightings = useLiveQuery(() => offlineDb.offlineSightings.toArray(), []) || [];
  const pendingCount = offlinePersons.filter(p => !p.synced).length + offlineSightings.filter(s => !s.synced).length;

  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState(30);
  const [regLoc, setRegLoc] = useState('Bhotekoshi Camp 3');
  const [regMed, setRegMed] = useState('');

  const [sightReportId, setSightReportId] = useState('SAH-2026-001458');
  const [sightName, setSightName] = useState('Dr. Milind Chitley');
  const [sightStatus, setSightStatus] = useState<'located_safe' | 'located_injured'>('located_safe');
  const [sightLoc, setSightLoc] = useState('Tatopani Emergency Outpost');

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleSaveOfflinePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;

    await offlineDb.offlinePersons.add({
      fullName: regName,
      approxAge: regAge,
      gender: 'male',
      foundLocation: regLoc,
      medicalCondition: regMed,
      timestamp: new Date().toISOString(),
      synced: false
    });

    setRegName('');
    setActiveForm('none');
    showFeedback('Saved to local device IndexedDB storage.');
  };

  const handleSaveOfflineSighting = async (e: React.FormEvent) => {
    e.preventDefault();

    await offlineDb.offlineSightings.add({
      reportId: sightReportId,
      personName: sightName,
      locationName: sightLoc,
      status: sightStatus,
      timestamp: new Date().toISOString(),
      synced: false
    });

    setActiveForm('none');
    showFeedback(`Sighting of ${sightName} cached offline. Ready to sync.`);
  };

  const handleSimulateQrScan = async () => {
    await offlineDb.offlineSightings.add({
      reportId: 'SAH-2026-001458',
      personName: 'Dr. Milind Chitley',
      locationName: 'Border Sector Staging Area B',
      status: 'located_safe',
      notes: 'Physical QR Emergency ID Card scanned directly on victim apparel',
      timestamp: new Date().toISOString(),
      synced: false
    });

    setActiveForm('none');
    showFeedback('Emergency QR Code scanned & decoded: Dr. Milind Chitley. Sighting saved to offline queue.');
  };

  const handleSyncQueue = async () => {
    if (!isOnline) {
      showFeedback('Cannot sync: Network is toggled offline. Switch to Online (Simulated) first.');
      return;
    }

    setIsSyncing(true);

    for (const s of offlineSightings.filter(item => !item.synced)) {
      if (s.reportId) {
        sahayataStore.updateReportStatus(
          s.reportId,
          s.status,
          s.locationName,
          'NDRF Field Unit (Offline Sync)'
        );
      }
      if (s.id) {
        await offlineDb.offlineSightings.update(s.id, { synced: true });
      }
    }

    for (const p of offlinePersons.filter(item => !item.synced)) {
      sahayataStore.submitReport({
        fullName: p.fullName,
        approxAge: p.approxAge,
        gender: 'male',
        medicalConditions: p.medicalCondition,
        lastKnownLocation: p.foundLocation,
        contactMethod: 'in_person',
        groupType: 'unknown',
        reporterName: 'NDRF Field Rescue Team',
        reporterPhone: '+91 112 0000',
        reporterRelationship: 'Field Extraction'
      });
      if (p.id) {
        await offlineDb.offlinePersons.update(p.id, { synced: true });
      }
    }

    setTimeout(() => {
      setIsSyncing(false);
      showFeedback('All offline records synchronized to the central NDRF Incident Command database!');
    }, 500);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-5">
      {/* Terminal Card */}
      <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-4">
        {feedbackMsg && (
          <div className="rounded-[8px] bg-[#A9F1CA] border border-[#3ECF8E] p-3 text-xs font-mono text-[#00482F] flex items-center justify-between">
            <span>{feedbackMsg}</span>
            <button onClick={() => setFeedbackMsg(null)} className="font-bold text-sm ml-2">&times;</button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#00A85A]" />
            <h1 className="font-display text-base font-semibold text-[#001A10]">
              {t('title')}
            </h1>
          </div>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[9999px] text-xs font-mono font-medium border transition-colors ${
              isOnline
                ? 'bg-[#A9F1CA]/40 text-[#00482F] border-[#6DD9A8]'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{isOnline ? 'Online (Simulated)' : 'Offline (No Signal)'}</span>
          </button>
        </div>

        <p className="text-xs text-[#001A10]/70 leading-relaxed font-[450]">
          {isOnline ? t('onlineBadge') : t('offlineBadge')}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-[rgba(0,26,16,0.06)] text-xs">
          <span className="font-mono text-[#001A10]/60">
            {pendingCount} records queued in IndexedDB
          </span>
          <button
            onClick={handleSyncQueue}
            disabled={isSyncing || pendingCount === 0}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#00A85A] hover:underline disabled:opacity-40"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Queue Now'}</span>
          </button>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => setActiveForm('register')}
          className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-5 hover:border-[#3ECF8E] transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[8px] bg-[#F8F3EF] text-[#001A10] flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-[#00A85A]" />
            </div>
            <span className="text-xs font-semibold text-[#001A10]">
              {t('actionRegister')}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-[#001A10]/40" />
        </button>

        <button
          onClick={() => setActiveForm('sighting')}
          className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-5 hover:border-[#3ECF8E] transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[8px] bg-[#F8F3EF] text-[#001A10] flex items-center justify-center">
              <Eye className="h-4 w-4 text-[#00A85A]" />
            </div>
            <span className="text-xs font-semibold text-[#001A10]">
              {t('actionSighting')}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-[#001A10]/40" />
        </button>

        <button
          onClick={() => setActiveForm('qr')}
          className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-5 hover:border-[#3ECF8E] transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[8px] bg-[#F8F3EF] text-[#001A10] flex items-center justify-center">
              <QrCode className="h-4 w-4 text-[#00A85A]" />
            </div>
            <span className="text-xs font-semibold text-[#001A10]">
              {t('actionScanQr')}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-[#001A10]/40" />
        </button>
      </div>

      {/* Register Form */}
      {activeForm === 'register' && (
        <form onSubmit={handleSaveOfflinePerson} className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-4">
          <h3 className="font-display text-sm font-semibold text-[#001A10]">Register Found Victim (Offline)</h3>
          <div>
            <label className="block text-xs font-medium text-[#001A10] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={regName}
              onChange={e => setRegName(e.target.value)}
              placeholder="e.g. Suresh Deshpande"
              className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">Approx Age</label>
              <input
                type="number"
                value={regAge}
                onChange={e => setRegAge(Number(e.target.value))}
                className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">Found Location</label>
              <input
                type="text"
                value={regLoc}
                onChange={e => setRegLoc(e.target.value)}
                className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#001A10] mb-1">Medical Status / Needs</label>
            <input
              type="text"
              value={regMed}
              onChange={e => setRegMed(e.target.value)}
              placeholder="e.g. Dehydrated, minor abrasion"
              className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-medium text-xs hover:bg-[#6DD9A8] transition-colors"
            >
              Save to Local DB
            </button>
            <button
              type="button"
              onClick={() => setActiveForm('none')}
              className="py-2 px-4 rounded-[8px] border border-[#001A10] bg-transparent text-[#001A10] font-medium text-xs hover:bg-[#001A10]/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Sighting Form */}
      {activeForm === 'sighting' && (
        <form onSubmit={handleSaveOfflineSighting} className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-4">
          <h3 className="font-display text-sm font-semibold text-[#001A10]">Record Victim Sighting</h3>
          <div>
            <label className="block text-xs font-medium text-[#001A10] mb-1">Target Case ID</label>
            <input
              type="text"
              value={sightReportId}
              onChange={e => setSightReportId(e.target.value)}
              className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3 py-2 text-xs font-mono text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#001A10] mb-1">Person Name</label>
            <input
              type="text"
              value={sightName}
              onChange={e => setSightName(e.target.value)}
              className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#001A10] mb-1">Verified Location</label>
            <input
              type="text"
              value={sightLoc}
              onChange={e => setSightLoc(e.target.value)}
              className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#001A10] mb-1">Status</label>
            <select
              value={sightStatus}
              onChange={e => setSightStatus(e.target.value as any)}
              className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
            >
              <option value="located_safe">Located / Safe</option>
              <option value="located_injured">Located / Injured (Needs Medevac)</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-medium text-xs hover:bg-[#6DD9A8] transition-colors"
            >
              Record Sighting Offline
            </button>
            <button
              type="button"
              onClick={() => setActiveForm('none')}
              className="py-2 px-4 rounded-[8px] border border-[#001A10] bg-transparent text-[#001A10] font-medium text-xs hover:bg-[#001A10]/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Scan Modal */}
      {activeForm === 'qr' && (
        <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-4 text-center">
          <div className="h-12 w-12 rounded-full bg-[#F8F3EF] text-[#00A85A] flex items-center justify-center mx-auto border border-[rgba(0,26,16,0.08)]">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="font-display text-sm font-semibold text-[#001A10]">Scan Victim Emergency QR Card</h3>
          <p className="text-xs text-[#001A10]/70 font-[450]">
            Simulates optical scan of physical Emergency ID Card issued at checkpoint.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleSimulateQrScan}
              className="py-2.5 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-medium text-xs hover:bg-[#6DD9A8] transition-colors"
            >
              Scan Victim Card: Dr. Milind Chitley (Pilgrim Group 17)
            </button>
            <button
              onClick={() => setActiveForm('none')}
              className="py-2 rounded-[8px] border border-[#001A10] bg-transparent text-[#001A10] text-xs font-medium hover:bg-[#001A10]/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Local Cached Queue List */}
      <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 space-y-3">
        <h3 className="font-mono text-xs text-[#001A10]/70 uppercase">
          Local IndexedDB Cache ({offlineSightings.length + offlinePersons.length} Records)
        </h3>

        {offlineSightings.length === 0 && offlinePersons.length === 0 ? (
          <p className="text-xs text-[#001A10]/60 py-3 text-center font-[450]">
            No local offline records yet. Tap any action above to log field sightings.
          </p>
        ) : (
          <div className="space-y-2">
            {offlineSightings.map(s => (
              <div key={s.id} className="p-3 rounded-[8px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[#001A10]">{s.personName}</div>
                  <div className="text-[#001A10]/60 text-[11px] font-mono">{s.locationName} • {s.status}</div>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-[9999px] text-[10px] font-mono font-medium ${
                  s.synced ? 'bg-[#A9F1CA] text-[#00482F]' : 'bg-amber-100 text-amber-900'
                }`}>
                  {s.synced ? 'Synced' : 'Pending Sync'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
