'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  AlertCircle,
  Shield,
  Copy,
  Check,
  Upload,
  Camera,
  CreditCard,
  Ticket,
  Users
} from 'lucide-react';
import { extractFromEmotionalText } from '@/lib/ai/nlpExtractor';
import { parseDocumentOCR, OCRScanResult } from '@/lib/ai/ocrManifest';
import {
  ExtractedDocument,
  SAMPLE_OCR_DOCUMENTS,
  parseUploadedDocument
} from '@/lib/ai/documentOCR';
import { sahayataStore } from '@/lib/store';
import { PersonReport } from '@/lib/types';

interface ReportPageProps {
  params: { locale: string };
}

export default function ReportPage({ params: { locale } }: ReportPageProps) {
  const t = useTranslations('report');
  const common = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const [step, setStep] = useState(1);
  const [submittedReport, setSubmittedReport] = useState<PersonReport | null>(null);
  const [copied, setCopied] = useState(false);

  // AI & OCR states
  const [aiText, setAiText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRScanResult | null>(null);

  // Smart Document & Ticket OCR State
  const [extractedDoc, setExtractedDoc] = useState<ExtractedDocument | null>(null);
  const [isDocScanning, setIsDocScanning] = useState(false);
  const [docAppliedNotice, setDocAppliedNotice] = useState(false);
  const [autoLinkCoPassengers, setAutoLinkCoPassengers] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    fullName: mode === 'self_sos' ? 'Stranded Citizen' : '',
    approxAge: 45,
    gender: 'male' as 'male' | 'female' | 'other' | 'unknown',
    clothing: '',
    medicalConditions: '',
    lastKnownLocation: 'Near Bhotekoshi River Bridge X',
    contactMethod: 'call' as 'call' | 'message' | 'in_person' | 'social_media' | 'other',
    groupType: 'pilgrimage' as 'tour' | 'trekking' | 'pilgrimage' | 'family' | 'alone' | 'unknown',
    groupName: 'Pilgrim Trail Group 17',
    permitNumber: 'KY-2026-BH-991',
    reporterName: 'Adv. Rohan Chitley',
    reporterPhone: '+91 98200 12345',
    reporterRelationship: 'Family Member',
    consent: true
  });

  const handleAIExtract = () => {
    if (!aiText.trim()) return;
    setIsExtracting(true);

    setTimeout(() => {
      const extracted = extractFromEmotionalText(aiText);
      setFormData(prev => ({
        ...prev,
        fullName: extracted.fullName || prev.fullName,
        approxAge: extracted.approxAge || prev.approxAge,
        gender: extracted.gender || prev.gender,
        clothing: extracted.clothing || prev.clothing,
        medicalConditions: extracted.medicalConditions || prev.medicalConditions,
        lastKnownLocation: extracted.lastKnownLocation || prev.lastKnownLocation,
        groupName: extracted.groupName || prev.groupName
      }));
      setIsExtracting(false);
    }, 250);
  };

  const handleOCRSimulate = (fileName: string) => {
    const result = parseDocumentOCR(fileName);
    setOcrResult(result);
    const outcome = sahayataStore.reconcileOCRDocument(result);

    setFormData(prev => ({
      ...prev,
      groupName: result.agencyName,
      permitNumber: result.permitNumber
    }));
  };

  const applyExtractedDocToForm = (doc: ExtractedDocument) => {
    setFormData(prev => ({
      ...prev,
      fullName: doc.fullName || prev.fullName,
      approxAge: doc.approxAge || prev.approxAge,
      gender: (doc.gender as any) || prev.gender,
      lastKnownLocation: doc.route || doc.seatOrRoom || prev.lastKnownLocation,
      groupName: doc.groupName || prev.groupName,
      permitNumber: doc.permitNumber || doc.documentNumberMasked || prev.permitNumber,
      medicalConditions: doc.medicalNotes ? (prev.medicalConditions ? `${prev.medicalConditions}, ${doc.medicalNotes}` : doc.medicalNotes) : prev.medicalConditions
    }));
    setDocAppliedNotice(true);
    setTimeout(() => setDocAppliedNotice(false), 4000);
  };

  const handleDocPresetSelect = (presetKey: 'aadhaar' | 'bus_ticket' | 'yatra_permit' | 'hotel_slip') => {
    setIsDocScanning(true);
    setTimeout(() => {
      const doc = SAMPLE_OCR_DOCUMENTS[presetKey];
      setExtractedDoc(doc);
      applyExtractedDocToForm(doc);
      setIsDocScanning(false);
    }, 300);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsDocScanning(true);
    setTimeout(() => {
      const doc = parseUploadedDocument(file.name);
      setExtractedDoc(doc);
      applyExtractedDocToForm(doc);
      setIsDocScanning(false);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert('Please provide the full name.');
      setStep(1);
      return;
    }

    const report = sahayataStore.submitReport({
      fullName: formData.fullName,
      approxAge: Number(formData.approxAge),
      gender: formData.gender,
      clothing: formData.clothing,
      medicalConditions: formData.medicalConditions,
      lastKnownLocation: formData.lastKnownLocation,
      contactMethod: formData.contactMethod,
      groupType: formData.groupType,
      groupName: formData.groupName,
      permitNumber: formData.permitNumber,
      reporterName: formData.reporterName || 'Direct Public Report',
      reporterPhone: formData.reporterPhone || '+91 98000 00000',
      reporterRelationship: formData.reporterRelationship,
      preferredLanguage: locale === 'hi' ? 'hi' : 'en',
      attachedDocument: extractedDoc ? {
        documentType: extractedDoc.documentType,
        documentTypeLabel: extractedDoc.documentTypeLabel,
        documentNumberMasked: extractedDoc.documentNumberMasked,
        issuerOrAgency: extractedDoc.issuerOrAgency,
        confidenceScore: extractedDoc.confidenceScore,
        seatOrRoom: extractedDoc.seatOrRoom,
        route: extractedDoc.route,
        coPassengers: extractedDoc.coPassengers
      } : undefined
    });

    setSubmittedReport(report);
    setStep(5);
  };

  const handleCopyId = () => {
    if (submittedReport) {
      navigator.clipboard.writeText(submittedReport.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Success Screen
  if (step === 5 && submittedReport) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
        <div className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-8 text-center space-y-5">
          <div className="h-12 w-12 rounded-full bg-[#A9F1CA]/40 border border-[#6DD9A8] text-[#00482F] flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div>
            <span className="font-mono text-xs text-[#00A85A] uppercase tracking-normal">
              Report Acknowledged
            </span>
            <h1 className="font-display text-2xl font-semibold text-[#001A10] mt-1">
              {submittedReport.fullName}
            </h1>
            <p className="text-xs font-[450] text-[#001A10]/70 mt-1">
              {t('saveNotice')}
            </p>
          </div>

          {/* Case ID Box */}
          <div className="rounded-[8px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] p-4 flex items-center justify-between">
            <div className="text-left">
              <div className="text-[10px] font-mono text-[#001A10]/60 uppercase tracking-normal">
                Official Case ID
              </div>
              <div className="text-xl font-mono font-bold text-[#001A10] mt-0.5">
                {submittedReport.id}
              </div>
            </div>
            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#001A10] bg-transparent text-xs font-medium text-[#001A10] hover:bg-[#001A10]/5 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#00A85A]" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Priority Score Summary */}
          <div className="rounded-[8px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF]/60 p-4 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#001A10]">
                Urgency Priority Tier
              </span>
              <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-[9999px]">
                {submittedReport.priority} (Score {submittedReport.priorityScore}/100)
              </span>
            </div>
            <ul className="text-xs text-[#001A10]/70 space-y-1 list-disc list-inside">
              {submittedReport.priorityFactors.map((f, i) => (
                <li key={i}>{f.label}</li>
              ))}
            </ul>
          </div>

          {/* Attached Document Verified Card */}
          {submittedReport.attachedDocument && (
            <div className="rounded-[8px] border border-[#6DD9A8] bg-[#A9F1CA]/20 p-3.5 text-left space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold text-[#00482F] flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00A85A]" />
                  Verified Identity / Travel Document Linked
                </span>
                <span className="font-mono text-[10px] bg-[#00482F] text-white px-2 py-0.5 rounded-[9999px]">
                  {submittedReport.attachedDocument.confidenceScore}% Confidence
                </span>
              </div>
              <div className="font-semibold text-sm text-[#001A10]">
                {submittedReport.attachedDocument.documentType} ({submittedReport.attachedDocument.documentNumberMasked})
              </div>
              {submittedReport.attachedDocument.seatOrRoom && (
                <div className="text-[#001A10]/70">
                  <strong className="text-[#001A10]">Seat / Room:</strong> {submittedReport.attachedDocument.seatOrRoom}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/${locale}/track?caseId=${submittedReport.id}`}
              className="flex-1 py-2 px-4 rounded-[8px] bg-[#3ECF8E] text-[#001A10] font-medium text-xs text-center hover:bg-[#6DD9A8] transition-colors"
            >
              Track Case Progress &rarr;
            </Link>
            <Link
              href={`/${locale}`}
              className="py-2 px-4 rounded-[8px] border border-[#001A10] bg-transparent text-[#001A10] font-medium text-xs text-center hover:bg-[#001A10]/5 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Header & Step Tracker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#001A10]/60">
          <span>Step {step} of 4</span>
          <span>{step === 1 ? t('step1Title') : step === 2 ? t('step2Title') : step === 3 ? t('step3Title') : t('step4Title')}</span>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-4 gap-1.5 h-1.5">
          <div className={`rounded-full ${step >= 1 ? 'bg-[#3ECF8E]' : 'bg-[rgba(0,26,16,0.08)]'}`} />
          <div className={`rounded-full ${step >= 2 ? 'bg-[#3ECF8E]' : 'bg-[rgba(0,26,16,0.08)]'}`} />
          <div className={`rounded-full ${step >= 3 ? 'bg-[#3ECF8E]' : 'bg-[rgba(0,26,16,0.08)]'}`} />
          <div className={`rounded-full ${step >= 4 ? 'bg-[#3ECF8E]' : 'bg-[rgba(0,26,16,0.08)]'}`} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[12px] border border-[rgba(0,26,16,0.08)] bg-white p-6 sm:p-8 space-y-6">
        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="border-b border-[rgba(0,26,16,0.08)] pb-3">
              <h2 className="font-display text-base font-semibold text-[#001A10]">{t('step1Title')}</h2>
              <p className="text-xs text-[#001A10]/70">Primary identifiers for rescue coordination.</p>
            </div>

            {/* Smart Document & Ticket OCR Auto-Fill Box */}
            <div className="rounded-[10px] border border-[#6DD9A8] bg-[#A9F1CA]/15 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#00482F]">
                  <FileText className="h-4 w-4 text-[#00A85A]" />
                  <span>{t('docOcrTitle')}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[9999px] bg-[#3ECF8E] text-[#001A10] font-semibold">
                  Fast-Track
                </span>
              </div>

              <p className="text-xs text-[#001A10]/80 font-[450] leading-relaxed">
                {t('docOcrSubtitle')}
              </p>

              {/* Upload Action & Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#001A10] text-white text-xs font-medium hover:bg-[#001A10]/90 cursor-pointer transition-colors">
                  <Upload className="h-3.5 w-3.5 text-[#3ECF8E]" />
                  <span>{isDocScanning ? 'Scanning Document...' : t('docOcrUploadBtn')}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isDocScanning}
                  />
                </label>

                <span className="text-[11px] font-mono text-[#001A10]/60">{t('docOcrPresetsLabel')}</span>
              </div>

              {/* 4 Realistic Scenario Presets */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleDocPresetSelect('aadhaar')}
                  disabled={isDocScanning}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-white hover:border-[#3ECF8E] text-[11px] font-mono text-[#001A10] transition-colors"
                >
                  <CreditCard className="h-3 w-3 text-[#00A85A]" />
                  <span>{t('docOcrAadhaarBtn')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDocPresetSelect('bus_ticket')}
                  disabled={isDocScanning}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-white hover:border-[#3ECF8E] text-[11px] font-mono text-[#001A10] transition-colors"
                >
                  <Ticket className="h-3 w-3 text-[#00A85A]" />
                  <span>{t('docOcrBusBtn')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDocPresetSelect('yatra_permit')}
                  disabled={isDocScanning}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-white hover:border-[#3ECF8E] text-[11px] font-mono text-[#001A10] transition-colors"
                >
                  <Shield className="h-3 w-3 text-[#00A85A]" />
                  <span>{t('docOcrYatraBtn')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDocPresetSelect('hotel_slip')}
                  disabled={isDocScanning}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-white hover:border-[#3ECF8E] text-[11px] font-mono text-[#001A10] transition-colors"
                >
                  <FileText className="h-3 w-3 text-[#00A85A]" />
                  <span>{t('docOcrHotelBtn')}</span>
                </button>
              </div>

              {/* Extracted Document Card */}
              {extractedDoc && (
                <div className="mt-3 rounded-[8px] border border-[#3ECF8E] bg-white p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(0,26,16,0.08)] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#00482F] bg-[#A9F1CA] px-2 py-0.5 rounded-[9999px]">
                        {extractedDoc.documentType}
                      </span>
                      <span className="font-mono text-xs text-[#001A10]/70">
                        {extractedDoc.documentNumberMasked}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-[#00A85A] font-semibold">
                      {extractedDoc.confidenceScore}% Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#001A10]/80">
                    <div>
                      <span className="text-[#001A10]/50 block font-mono text-[10px] uppercase">Passenger / Subject</span>
                      <strong className="text-[#001A10] text-sm">{extractedDoc.fullName}</strong>
                      <span className="text-xs text-[#001A10]/70 block">{extractedDoc.approxAge}y • {extractedDoc.gender}</span>
                    </div>

                    <div>
                      <span className="text-[#001A10]/50 block font-mono text-[10px] uppercase">Carrier / Issuer</span>
                      <span className="text-[#001A10] font-medium">{extractedDoc.issuerOrAgency}</span>
                      {extractedDoc.seatOrRoom && (
                        <span className="text-xs text-[#00A85A] block font-mono font-semibold">{extractedDoc.seatOrRoom}</span>
                      )}
                    </div>
                  </div>

                  {extractedDoc.route && (
                    <div className="text-xs pt-1 border-t border-[rgba(0,26,16,0.06)]">
                      <span className="text-[#001A10]/50 font-mono text-[10px] uppercase block">Route / Transit Corridor</span>
                      <span className="text-[#001A10] font-medium">{extractedDoc.route}</span>
                    </div>
                  )}

                  {/* Co-Passengers Detection */}
                  {extractedDoc.coPassengers.length > 0 && (
                    <div className="rounded-[6px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#00482F] uppercase font-bold flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {t('docOcrCoPassengers')} ({extractedDoc.coPassengers.length}):
                        </span>
                        <span className="text-[10px] text-[#00A85A] font-mono">Shared Booking</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {extractedDoc.coPassengers.map((cp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-[4px] bg-white border border-[rgba(0,26,16,0.08)] text-[11px] text-[#001A10]"
                          >
                            {cp.name} {cp.seatOrBerth ? `(${cp.seatOrBerth})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {docAppliedNotice && (
                    <div className="flex items-center gap-1.5 text-xs text-[#00482F] bg-[#A9F1CA]/40 p-2 rounded-[6px] font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#00A85A]" />
                      <span>{t('docOcrApplied')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Text Parsing Box */}
            <div className="rounded-[8px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#00482F]">
                <Sparkles className="h-3.5 w-3.5 text-[#00A85A]" />
                <span>AI Message Extraction Assistant</span>
              </div>
              <p className="text-xs text-[#001A10]/70 font-[450]">
                Paste a distress note or WhatsApp message to auto-fill form inputs.
              </p>
              <textarea
                value={aiText}
                onChange={e => setAiText(e.target.value)}
                rows={2}
                placeholder={t('aiAssistPlaceholder')}
                className="w-full text-xs p-2.5 rounded-[6px] border border-[rgba(0,26,16,0.12)] bg-white text-[#001A10] placeholder:text-[#001A10]/40 focus:outline-none focus:border-[#3ECF8E]"
              />
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAIExtract}
                  disabled={isExtracting || !aiText.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#3ECF8E] text-[#001A10] text-xs font-medium hover:bg-[#6DD9A8] transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3 text-[#00482F]" />
                  <span>{isExtracting ? 'Extracting...' : 'Extract Fields with AI'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiText("Please help!! My father Dr. Milind Chitley, 54 yrs old, was last seen near Bhotekoshi Gorge Bridge wearing a blue windcheater. He is an acute asthma patient and has run out of his inhaler. He was with Pilgrim Trail Group 17! Please rescue him!");
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-[#00A85A] hover:underline"
                >
                  Paste Sample Distress Note
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#001A10] mb-1">
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t('fullNamePlaceholder')}
                  className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#001A10] mb-1">
                    {t('approxAge')}
                  </label>
                  <input
                    type="number"
                    value={formData.approxAge}
                    onChange={e => setFormData({ ...formData, approxAge: Number(e.target.value) })}
                    className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#001A10] mb-1">
                    {t('gender')}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="male">{t('genderMale')}</option>
                    <option value="female">{t('genderFemale')}</option>
                    <option value="other">{t('genderOther')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#001A10] mb-1">
                  {t('clothing')}
                </label>
                <input
                  type="text"
                  value={formData.clothing}
                  onChange={e => setFormData({ ...formData, clothing: e.target.value })}
                  placeholder={t('clothingPlaceholder')}
                  className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-rose-800 mb-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{t('medicalAlert')}</span>
                </label>
                <input
                  type="text"
                  value={formData.medicalConditions}
                  onChange={e => setFormData({ ...formData, medicalConditions: e.target.value })}
                  placeholder={t('medicalAlertPlaceholder')}
                  className="w-full border border-rose-200 bg-rose-50/40 rounded-[8px] px-3.5 py-2 text-xs text-[#001A10] focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="border-b border-[rgba(0,26,16,0.08)] pb-3">
              <h2 className="font-display text-base font-semibold text-[#001A10]">{t('step2Title')}</h2>
              <p className="text-xs text-[#001A10]/70">Location context for priority search sectoring.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">
                {t('lastSeenLocation')} *
              </label>
              <input
                type="text"
                required
                value={formData.lastKnownLocation}
                onChange={e => setFormData({ ...formData, lastKnownLocation: e.target.value })}
                placeholder={t('lastSeenPlaceholder')}
                className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">
                {t('contactMethod')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'call', label: t('methodCall') },
                  { key: 'message', label: t('methodMessage') },
                  { key: 'in_person', label: t('methodInPerson') },
                  { key: 'other', label: t('methodOther') }
                ].map(m => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, contactMethod: m.key as any })}
                    className={`p-2.5 rounded-[8px] border text-xs font-medium text-left transition-colors ${
                      formData.contactMethod === m.key
                        ? 'border-[#3ECF8E] bg-[#A9F1CA]/20 text-[#00482F] font-semibold'
                        : 'border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] text-[#001A10] hover:bg-[#F8F3EF]/80'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="border-b border-[rgba(0,26,16,0.08)] pb-3">
              <h2 className="font-display text-base font-semibold text-[#001A10]">{t('step3Title')}</h2>
              <p className="text-xs text-[#001A10]/70">Links co-travelers and recovers manifests.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">
                {t('groupType')}
              </label>
              <select
                value={formData.groupType}
                onChange={e => setFormData({ ...formData, groupType: e.target.value as any })}
                className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              >
                <option value="pilgrimage">{t('groupTypePilgrim')}</option>
                <option value="tour">{t('groupTypeTour')}</option>
                <option value="trekking">{t('groupTypeTrek')}</option>
                <option value="family">{t('groupTypeFamily')}</option>
                <option value="alone">{t('groupTypeAlone')}</option>
                <option value="unknown">{t('groupTypeUnknown')}</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#001A10] mb-1">
                  {t('groupName')}
                </label>
                <input
                  type="text"
                  value={formData.groupName}
                  onChange={e => setFormData({ ...formData, groupName: e.target.value })}
                  placeholder={t('groupNamePlaceholder')}
                  className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#001A10] mb-1">
                  {t('permitNumber')}
                </label>
                <input
                  type="text"
                  value={formData.permitNumber}
                  onChange={e => setFormData({ ...formData, permitNumber: e.target.value })}
                  placeholder="e.g. KY-2026-BH-991"
                  className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs font-mono text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>
            </div>

            {/* OCR Upload Card */}
            <div className="rounded-[8px] border border-dashed border-[rgba(0,26,16,0.15)] bg-[#F8F3EF] p-4 text-center space-y-2">
              <FileText className="h-5 w-5 text-[#00A85A] mx-auto" />
              <div className="text-xs font-mono font-medium text-[#001A10]">
                {t('ocrUploadTitle')}
              </div>
              <p className="text-xs text-[#001A10]/70 max-w-sm mx-auto font-[450]">
                {t('ocrUploadDesc')}
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOCRSimulate('kailash_safaris_bus_manifest.jpg')}
                  className="px-3 py-1.5 rounded-[6px] border border-[#001A10] bg-white text-[#001A10] text-xs font-medium hover:bg-[#001A10]/5 transition-colors"
                >
                  Scan Bus Manifest (61 Pax)
                </button>
                <button
                  type="button"
                  onClick={() => handleOCRSimulate('hotel_tatopani_roster.jpg')}
                  className="px-3 py-1.5 rounded-[6px] border border-[#001A10] bg-white text-[#001A10] text-xs font-medium hover:bg-[#001A10]/5 transition-colors"
                >
                  Scan Hotel Guest Roster
                </button>
              </div>
            </div>

            {ocrResult && (
              <div className="rounded-[8px] border border-[#6DD9A8] bg-[#A9F1CA]/20 p-4 text-xs space-y-2 text-[#001A10]">
                <div className="flex items-center justify-between font-mono font-medium text-[#00482F]">
                  <span>OCR Document Match: {ocrResult.agencyName}</span>
                  <span className="px-2 py-0.5 rounded-[9999px] bg-[#3ECF8E] text-[#001A10] text-[10px]">
                    {ocrResult.passengers.length} Pax Extracted
                  </span>
                </div>
                <p className="text-[11px] text-[#001A10]/70 font-[450]">
                  Reconciled with existing records and imported newly discovered co-travelers to the manifest.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ocrResult.passengers.slice(0, 6).map((p, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-[rgba(0,26,16,0.08)] rounded text-[11px]">
                      {p.name} ({p.seatOrRoom || 'Pax'})
                    </span>
                  ))}
                  {ocrResult.passengers.length > 6 && (
                    <span className="px-2 py-0.5 bg-[#A9F1CA] text-[#00482F] rounded text-[11px] font-mono">
                      +{ocrResult.passengers.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 4 ================= */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="border-b border-[rgba(0,26,16,0.08)] pb-3">
              <h2 className="font-display text-base font-semibold text-[#001A10]">{t('step4Title')}</h2>
              <p className="text-xs text-[#001A10]/70">For sending verified updates directly to you.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#001A10] mb-1">
                {t('reporterName')} *
              </label>
              <input
                type="text"
                required
                value={formData.reporterName}
                onChange={e => setFormData({ ...formData, reporterName: e.target.value })}
                placeholder="e.g. Adv. Rohan Chitley"
                className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#001A10] mb-1">
                  {t('relationship')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.reporterRelationship}
                  onChange={e => setFormData({ ...formData, reporterRelationship: e.target.value })}
                  placeholder="e.g. Son, Sister, Tour Guide"
                  className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#001A10] mb-1">
                  {t('reporterPhone')} *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.reporterPhone}
                  onChange={e => setFormData({ ...formData, reporterPhone: e.target.value })}
                  placeholder="e.g. +91 98200 12345"
                  className="w-full border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] rounded-[8px] px-3.5 py-2 text-xs font-mono text-[#001A10] focus:outline-none focus:border-[#3ECF8E]"
                />
              </div>
            </div>

            {/* Verification Summary Card */}
            <div className="rounded-[8px] border border-[rgba(0,26,16,0.08)] bg-[#F8F3EF] p-4 space-y-2 text-xs">
              <span className="font-mono text-[10px] text-[#001A10]/60 uppercase tracking-normal block">
                Case Preview
              </span>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#001A10]">{formData.fullName}</span>
                <span className="text-[#001A10]/70">{formData.approxAge} yrs • {formData.gender}</span>
              </div>
              <div className="text-[#001A10]/70">
                <strong className="text-[#001A10]">Location:</strong> {formData.lastKnownLocation}
              </div>

              {extractedDoc && (
                <div className="mt-2 pt-2 border-t border-[rgba(0,26,16,0.08)] flex items-center justify-between text-[#00482F]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#00A85A]" />
                    <span className="font-medium">
                      Verified Document: {extractedDoc.documentType} ({extractedDoc.documentNumberMasked})
                    </span>
                  </div>
                  <span className="font-mono text-[10px] bg-[#A9F1CA] px-2 py-0.5 rounded-[9999px] font-bold">
                    {extractedDoc.confidenceScore}% Confidence
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-start gap-2">
              <input
                type="checkbox"
                id="consent"
                required
                checked={formData.consent}
                onChange={e => setFormData({ ...formData, consent: e.target.checked })}
                className="mt-0.5 rounded border-[rgba(0,26,16,0.2)] text-[#00A85A] focus:ring-[#3ECF8E]"
              />
              <label htmlFor="consent" className="text-xs text-[#001A10]/70 leading-relaxed font-[450]">
                {t('consentText')}
              </label>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(0,26,16,0.08)]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] border border-[#001A10] bg-transparent text-xs font-medium text-[#001A10] hover:bg-[#001A10]/5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{common('back')}</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#3ECF8E] text-[#001A10] text-xs font-medium hover:bg-[#6DD9A8] transition-colors"
            >
              <span>{common('next')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[8px] bg-[#3ECF8E] text-[#001A10] text-xs font-medium hover:bg-[#6DD9A8] transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>{common('submit')}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
