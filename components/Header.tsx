'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LifeBuoy, Lock, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const nav = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout, openClearanceModal } = useAuth();

  const getLocalizedPath = (targetLocale: string) => {
    if (!pathname) return `/${targetLocale}`;
    const segments = pathname.split('/');
    if (segments[1] === 'en' || segments[1] === 'hi') {
      segments[1] = targetLocale;
      return segments.join('/');
    }
    return `/${targetLocale}${pathname}`;
  };

  const handleLanguageSwitch = (targetLocale: string) => {
    const nextPath = getLocalizedPath(targetLocale);
    router.push(nextPath);
  };

  const isActive = (path: string) => {
    const cleanPath = pathname.replace(/^\/(en|hi)/, '') || '/';
    return cleanPath === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(0,26,16,0.08)] bg-[#F8F3EF]/90 backdrop-blur-md">
      {/* Main Supabase 65px Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[65px] flex items-center justify-between">
        {/* Supabase-style Wordmark */}
        <div className="flex items-center gap-3">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-[8px] bg-[#001A10] text-[#3ECF8E] flex items-center justify-center font-bold">
              <LifeBuoy className="h-4 w-4" />
            </div>
            <span className="font-display font-semibold text-lg text-[#001A10] tracking-normal">
              SAHAYATA
            </span>
          </Link>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-5 text-[14px] font-[450] text-[#001A10]">
          <Link
            href={`/${locale}`}
            className={`transition-colors ${
              isActive('/')
                ? 'text-[#00A85A] font-[500]'
                : 'hover:text-[#00A85A]'
            }`}
          >
            {nav('citizenPortal')}
          </Link>

          <Link
            href={`/${locale}/pre-disaster`}
            className={`transition-colors ${
              isActive('/pre-disaster')
                ? 'text-[#00A85A] font-[500]'
                : 'hover:text-[#00A85A]'
            }`}
          >
            {nav('preDisaster')}
          </Link>

          <Link
            href={`/${locale}/dashboard`}
            className={`transition-colors flex items-center gap-1.5 ${
              isActive('/dashboard')
                ? 'text-[#00A85A] font-[500]'
                : 'hover:text-[#00A85A]'
            }`}
          >
            {!isAuthenticated && <Lock className="h-3 w-3 opacity-50" />}
            <span>{nav('authorityDashboard')}</span>
          </Link>

          <Link
            href={`/${locale}/field`}
            className={`transition-colors flex items-center gap-1.5 ${
              isActive('/field')
                ? 'text-[#00A85A] font-[500]'
                : 'hover:text-[#00A85A]'
            }`}
          >
            {!isAuthenticated && <Lock className="h-3 w-3 opacity-50" />}
            <span>{nav('fieldMode')}</span>
          </Link>

          <Link
            href={`/${locale}/track`}
            className={`transition-colors ${
              isActive('/track')
                ? 'text-[#00A85A] font-[500]'
                : 'hover:text-[#00A85A]'
            }`}
          >
            {nav('trackCase')}
          </Link>
        </nav>

        {/* Right: Language Pill & Auth Clearance Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Pill */}
          <div className="inline-flex rounded-[8px] border border-[rgba(0,26,16,0.12)] bg-[#F8F3EF] p-0.5 text-xs font-mono">
            <button
              onClick={() => handleLanguageSwitch('en')}
              className={`px-2.5 py-1 rounded-[6px] transition-all ${
                locale === 'en'
                  ? 'bg-[#3ECF8E] text-[#001A10] font-medium shadow-none'
                  : 'text-[#001A10]/70 hover:text-[#001A10]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageSwitch('hi')}
              className={`px-2.5 py-1 rounded-[6px] transition-all ${
                locale === 'hi'
                  ? 'bg-[#3ECF8E] text-[#001A10] font-medium shadow-none'
                  : 'text-[#001A10]/70 hover:text-[#001A10]'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* NDRF Login Button / Authenticated Badge - Positioned to the right of Language Selector */}
          {isAuthenticated ? (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[8px] border border-[#6DD9A8] bg-[#A9F1CA]/30 text-xs font-mono text-[#00482F]">
              <Shield className="h-3.5 w-3.5 text-[#00A85A]" />
              <span className="font-semibold hidden lg:inline">{user?.name || '8th Bn NDRF'}</span>
              <span className="font-semibold lg:hidden">8th Bn NDRF</span>
              <button
                onClick={logout}
                title="Revoke clearance and return to Citizen View"
                className="ml-1 text-[11px] text-[#001A10]/60 hover:text-rose-600 underline font-sans"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={openClearanceModal}
              className="inline-flex items-center px-3.5 py-1.5 rounded-[8px] border border-[#6DD9A8] bg-white hover:bg-[#A9F1CA]/20 text-[#00482F] text-xs font-mono font-semibold transition-all shadow-sm"
            >
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Submenu */}
      <div className="md:hidden flex items-center gap-3 overflow-x-auto px-4 py-2 border-t border-[rgba(0,26,16,0.06)] bg-[#F8F3EF] text-xs font-medium no-scrollbar">
        <Link
          href={`/${locale}`}
          className={`px-2.5 py-1 rounded-[6px] whitespace-nowrap ${
            isActive('/') ? 'bg-[#3ECF8E] text-[#001A10] font-medium' : 'text-[#001A10]/70'
          }`}
        >
          {nav('citizenPortal')}
        </Link>
        <Link
          href={`/${locale}/pre-disaster`}
          className={`px-2.5 py-1 rounded-[6px] whitespace-nowrap ${
            isActive('/pre-disaster') ? 'bg-[#3ECF8E] text-[#001A10] font-medium' : 'text-[#001A10]/70'
          }`}
        >
          {nav('preDisaster')}
        </Link>
        <Link
          href={`/${locale}/dashboard`}
          className={`px-2.5 py-1 rounded-[6px] whitespace-nowrap flex items-center gap-1 ${
            isActive('/dashboard') ? 'bg-[#3ECF8E] text-[#001A10] font-medium' : 'text-[#001A10]/70'
          }`}
        >
          {!isAuthenticated && <Lock className="h-3 w-3 opacity-50" />}
          <span>{nav('authorityDashboard')}</span>
        </Link>
        <Link
          href={`/${locale}/field`}
          className={`px-2.5 py-1 rounded-[6px] whitespace-nowrap flex items-center gap-1 ${
            isActive('/field') ? 'bg-[#3ECF8E] text-[#001A10] font-medium' : 'text-[#001A10]/70'
          }`}
        >
          {!isAuthenticated && <Lock className="h-3 w-3 opacity-50" />}
          <span>{nav('fieldMode')}</span>
        </Link>
        <Link
          href={`/${locale}/track`}
          className={`px-2.5 py-1 rounded-[6px] whitespace-nowrap ${
            isActive('/track') ? 'bg-[#3ECF8E] text-[#001A10] font-medium' : 'text-[#001A10]/70'
          }`}
        >
          {nav('trackCase')}
        </Link>
      </div>
    </header>
  );
}
