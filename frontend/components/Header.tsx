'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, LogOut, Shield, RefreshCw, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import AuthModal from '@/components/AuthModal';

export default function Header() {
  const { profile, loading, authOpen, setAuthOpen, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-[#020617]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer select-none">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span className="font-bold text-white text-lg font-display tracking-tight hover:text-amber-400 transition-colors">
            PixelFlow AI
          </span>
        </Link>

        {/* Desktop Navigation links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              pathname === '/' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Principal
          </Link>

          <Link
            href="/blog"
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              pathname.startsWith('/blog') ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blog
          </Link>

          {profile && (
            <>
              <Link
                href="/app"
                className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                  pathname === '/app' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Painel
              </Link>

              {profile.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                    pathname === '/admin' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Session actions */}
        <div className="flex items-center gap-4">
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
          ) : profile ? (
            <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
              <div className="hidden sm:block text-right">
                <span className="text-xs font-semibold text-slate-100 block">{profile.displayName}</span>
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block font-mono">
                  {profile.role === 'admin' ? 'Acesso Ilimitado' : `${profile.credits} Créditos`}
                </span>
              </div>

              <button
                onClick={logout}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                title="Desconectar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-lg cursor-pointer"
            >
              Criar Conta
            </button>
          )}
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-md p-4 absolute top-16 left-0 right-0 shadow-xl flex flex-col gap-4 z-50">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`text-xs font-semibold uppercase tracking-wider p-2 transition-colors ${
              pathname === '/' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Principal
          </Link>

          <Link
            href="/blog"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`text-xs font-semibold uppercase tracking-wider p-2 transition-colors ${
              pathname.startsWith('/blog') ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blog
          </Link>

          {profile && (
            <>
              <Link
                href="/app"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-xs font-semibold uppercase tracking-wider p-2 transition-colors ${
                  pathname === '/app' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Painel
              </Link>

              {profile.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 p-2 transition-colors ${
                    pathname === '/admin' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </Link>
              )}
            </>
          )}
        </div>
      )}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
