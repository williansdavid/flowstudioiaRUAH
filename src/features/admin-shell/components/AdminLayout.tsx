import { useState, useEffect } from 'react';
import { Outlet, useMatches } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useSignOut } from '@/features/auth/hooks';
import type { SessionData } from '@/features/auth/types';
import { BottomTab } from './BottomTab';


interface AdminLayoutProps {
  session: SessionData;
  studioName: string;
}

export function AdminLayout({ session, studioName }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [topOffset, setTopOffset] = useState(0);
  const signOut = useSignOut();
  const matches = useMatches();

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setTopOffset(Math.max(vv.offsetTop, 0));
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  // Pega o título do match mais profundo que define staticData.title.
  const title =
    [...matches]
      .reverse()
      .find((m) => m.staticData.title)?.staticData.title ?? studioName;

  const handleSignOut = () => signOut.mutate();

  return (
    <div
      className="flex overflow-hidden"
      style={{
        height: topOffset > 0 ? `calc(100dvh - ${topOffset}px)` : '100dvh',
        marginTop: topOffset > 0 ? topOffset : 0,
        background: 'var(--gradient-app)',
      }}
    >
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <Sidebar
          session={session}
          studioName={studioName}
          onSignOut={handleSignOut}
          isSigningOut={signOut.isPending}
        />
      </aside>

      {/* Drawer mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 backdrop-blur-xl lg:hidden"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--color-surface) 95%, transparent)',
              }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-2 top-4 z-10 rounded-[var(--radius-button)] p-2 text-[var(--color-text-body)] hover:bg-[var(--color-surface-alt)]"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
              <Sidebar
                session={session}
                studioName={studioName}
                onSignOut={handleSignOut}
                isSigningOut={signOut.isPending}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onOpenMenu={() => setMobileOpen(true)} />
        <main className="relative flex-1 overflow-y-auto p-4 pb-14 lg:p-6 lg:pb-6">
          <div
            className="pointer-events-none absolute inset-0 bg-black/30"
            aria-hidden
          />
          <div className="relative mx-auto h-full max-w-7xl">
            <Outlet />
          </div>
        </main>
        <BottomTab />
      </div>
    </div>
  );
}