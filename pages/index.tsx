import { useState } from 'react';
import Head from 'next/head';
import { useTrackerStore } from '@/store/trackerStore';
import { useTheme } from '@/hooks/useTheme';

import Sidebar          from '@/components/Sidebar';
import TrackerHeader    from '@/components/TrackerHeader';
import FilterPopover    from '@/components/FilterPopover';
import TrackerSection   from '@/components/TrackerSection';
import TrackerEntry     from '@/components/TrackerEntry';
import WeaponsView      from '@/components/WeaponsView';
import PriorityPanel    from '@/components/PriorityPanel';
import UpcomingSection  from '@/components/UpcomingSection';

import ExportModal       from '@/components/modals/ExportModal';
import ImportModal       from '@/components/modals/ImportModal';
import SnapshotModal       from '@/components/modals/SnapshotModal';
import WeaponSnapshotModal from '@/components/modals/WeaponSnapshotModal';
import EditUpcomingModal from '@/components/modals/EditUpcomingModal';
import ReleaseModal      from '@/components/modals/ReleaseModal';

import type { ModalType, SidebarTab } from '@/types';

export default function Home() {
  useTheme();

  const versions     = useTrackerStore(s => s.versions);
  const activeFilter = useTrackerStore(s => s.activeFilter);
  const resetAll     = useTrackerStore(s => s.resetAll);

  const [tab,          setTab]          = useState<SidebarTab>('characters');
  const [openModal,    setOpenModal]    = useState<ModalType>(null);
  const [editingUid,   setEditingUid]   = useState<number | null>(null);
  const [releasingUid, setReleasingUid] = useState<number | null>(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  const handleReset = () => {
    if (confirm('Reset everything including priority and upcoming?')) resetAll();
  };

  const handleOpenEdit    = (uid: number) => { setEditingUid(uid);   setOpenModal('edit-upcoming'); };
  const handleOpenRelease = (uid: number) => { setReleasingUid(uid); setOpenModal('release'); };

  const close = () => {
    setOpenModal(null);
    setEditingUid(null);
    setReleasingUid(null);
  };

  // Main content renderer
  const renderContent = () => {
    if (tab === 'weapons')  return <WeaponsView />;
    if (tab === 'priority') return <PriorityPanel />;

    // Characters tab
    return (
      <div className="px-4 py-4">
        <FilterPopover />
        {activeFilter !== 'All' ? (
          <div className="card-grid flex flex-wrap gap-2">
            {versions
              .flatMap(g => g.entries)
              .filter(e => e.element === activeFilter)
              .map(e => <TrackerEntry key={e.id} entry={e} />)
            }
          </div>
        ) : (
          <>
            {versions.map(group => (
              <TrackerSection key={group.label} group={group} forceOpen={true} forceKey={0} />
            ))}
            <UpcomingSection onOpenRelease={handleOpenRelease} onOpenEdit={handleOpenEdit} />
          </>
        )}
      </div>
    );
  };

  const SidebarEl = (
    <Sidebar tab={tab} setTab={t => { setTab(t); setSidebarOpen(false); }} onOpen={setOpenModal} />
  );

  return (
    <>
      <Head>
        <title>WuWa Tracker</title>
        <meta name="description" content="Wuthering Waves limited resonator tracker" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="favicon.ico" />
      </Head>

      <div className="bg-bg flex h-screen overflow-hidden">

        {/* ═══ SIDEBAR — narrow icon rail, hidden on mobile ═══ */}
        <aside className="hidden md:flex w-[72px] flex-shrink-0 flex-col border-r border-border overflow-hidden bg-surface/40">
          {SidebarEl}
        </aside>

        {/* ═══ MOBILE SIDEBAR DRAWER ═══ */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <aside
              className="absolute left-0 top-0 bottom-0 w-[72px] bg-bg border-r border-border flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {SidebarEl}
            </aside>
          </div>
        )}

        {/* ═══ MAIN ═══ */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Top bar */}
          <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-border flex items-center gap-2">
            <button
              className="md:hidden w-8 h-8 rounded-lg border border-border flex items-center justify-center text-subtext hover:text-text transition-all flex-shrink-0"
              onClick={() => setSidebarOpen(v => !v)}
              title="Menu"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <TrackerHeader onOpen={setOpenModal} onReset={handleReset} tab={tab} />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      {openModal === 'export'        && <ExportModal onClose={close} />}
      {openModal === 'import'        && <ImportModal onClose={close} />}
      {openModal === 'snapshot'        && <SnapshotModal onClose={close} />}
      {openModal === 'weapon-snapshot' && <WeaponSnapshotModal onClose={close} />}
      {openModal === 'edit-upcoming' && editingUid   !== null && <EditUpcomingModal uid={editingUid}   onClose={close} />}
      {openModal === 'release'       && releasingUid !== null && <ReleaseModal      uid={releasingUid} onClose={close} />}
    </>
  );
}
