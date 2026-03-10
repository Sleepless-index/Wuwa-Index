import { useState, useCallback } from 'react';
import Head from 'next/head';
import { useTrackerStore } from '@/store/trackerStore';
import { useTheme } from '@/hooks/useTheme';

import Header           from '@/components/Header';
import StatsBar         from '@/components/StatsBar';
import ProgressBars     from '@/components/ProgressBars';
import ElementBreakdown from '@/components/ElementBreakdown';
import PriorityList     from '@/components/PriorityList';
import TrackerHeader    from '@/components/TrackerHeader';
import TrackerSection   from '@/components/TrackerSection';
import UpcomingSection  from '@/components/UpcomingSection';

import ExportModal       from '@/components/modals/ExportModal';
import ImportModal       from '@/components/modals/ImportModal';
import SnapshotModal     from '@/components/modals/SnapshotModal';
import EditUpcomingModal from '@/components/modals/EditUpcomingModal';
import ReleaseModal      from '@/components/modals/ReleaseModal';

import type { ModalType } from '@/types';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  const versions = useTrackerStore(s => s.versions);
  const resetAll = useTrackerStore(s => s.resetAll);

  const [openModal,    setOpenModal]    = useState<ModalType>(null);
  const [editingUid,   setEditingUid]   = useState<number | null>(null);
  const [releasingUid, setReleasingUid] = useState<number | null>(null);

  // Collapse-all: allOpen drives the next forced state, forceKey triggers it
  const [allOpen,    setAllOpen]    = useState(true);
  const [forceKey,   setForceKey]   = useState(0);

  const handleToggleAll = useCallback(() => {
    setAllOpen(v => {
      const next = !v;
      setForceKey(k => k + 1);
      return next;
    });
  }, []);

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

  return (
    <>
      <Head>
        <title>WuWa Tracker</title>
        <meta name="description" content="Wuthering Waves limited resonator tracker" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="favicon.ico" />
      </Head>

      {/* ── Full-viewport horizontal layout ── */}
      <div className="bg-bg flex h-screen overflow-hidden">

        {/* ═══ LEFT PANEL — stats, priority, elements ═══ */}
        <aside className="
          w-72 flex-shrink-0 flex flex-col
          border-r border-border overflow-y-auto
          px-5 py-6
        ">
          <Header theme={theme} onToggleTheme={toggleTheme} />
          <StatsBar />
          <ProgressBars />
          <PriorityList />
          <ElementBreakdown />
        </aside>

        {/* ═══ RIGHT PANEL — tracker rows with own scroll ═══ */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Fixed top bar with action buttons + collapse toggle */}
          <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-border">
            <TrackerHeader
              allOpen={allOpen}
              onToggleAll={handleToggleAll}
              onOpen={setOpenModal}
              onReset={handleReset}
            />
          </div>

          {/* Scrollable tracker list */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {versions.map(group => (
              <TrackerSection
                key={group.label}
                group={group}
                forceOpen={allOpen}
                forceKey={forceKey}
              />
            ))}

            <UpcomingSection
              onOpenRelease={handleOpenRelease}
              onOpenEdit={handleOpenEdit}
            />
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      {openModal === 'export'        && <ExportModal onClose={close} />}
      {openModal === 'import'        && <ImportModal onClose={close} />}
      {openModal === 'snapshot'      && <SnapshotModal onClose={close} />}
      {openModal === 'edit-upcoming' && editingUid   !== null && <EditUpcomingModal uid={editingUid}   onClose={close} />}
      {openModal === 'release'       && releasingUid !== null && <ReleaseModal      uid={releasingUid} onClose={close} />}
    </>
  );
}
