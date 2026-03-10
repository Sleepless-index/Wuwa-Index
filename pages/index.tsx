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

  const versions  = useTrackerStore(s => s.versions);
  const resetAll  = useTrackerStore(s => s.resetAll);

  const [openModal,    setOpenModal]    = useState<ModalType>(null);
  const [editingUid,   setEditingUid]   = useState<number | null>(null);
  const [releasingUid, setReleasingUid] = useState<number | null>(null);

  // Collapse-all state: we drive this by toggling a key that TrackerSection reads
  const [allOpen, setAllOpen] = useState(true);
  const [collapseKey, setCollapseKey] = useState(0); // bump to signal sections

  const handleToggleAll = useCallback(() => {
    setAllOpen(v => !v);
    setCollapseKey(k => k + 1);
  }, []);

  const handleReset = () => {
    if (confirm('Reset everything including priority and upcoming?')) resetAll();
  };

  const handleOpenEdit = (uid: number) => {
    setEditingUid(uid);
    setOpenModal('edit-upcoming');
  };

  const handleOpenRelease = (uid: number) => {
    setReleasingUid(uid);
    setOpenModal('release');
  };

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

      <main className="bg-bg min-h-screen">
        <div className="max-w-[680px] mx-auto px-4 sm:px-7 py-8">
          <Header theme={theme} onToggleTheme={toggleTheme} />

          <StatsBar />
          <ProgressBars />
          <PriorityList />
          <ElementBreakdown />

          <TrackerHeader
            allOpen={allOpen}
            onToggleAll={handleToggleAll}
            onOpen={setOpenModal}
            onReset={handleReset}
          />

          <div>
            {versions.map(group => (
              <TrackerSection
                key={group.label + collapseKey}
                group={group}
              />
            ))}
          </div>

          <UpcomingSection
            onOpenRelease={handleOpenRelease}
            onOpenEdit={handleOpenEdit}
          />
        </div>
      </main>

      {/* Modals */}
      {openModal === 'export'        && <ExportModal onClose={close} />}
      {openModal === 'import'        && <ImportModal onClose={close} />}
      {openModal === 'snapshot'      && <SnapshotModal onClose={close} />}
      {openModal === 'edit-upcoming' && editingUid   !== null && <EditUpcomingModal uid={editingUid}   onClose={close} />}
      {openModal === 'release'       && releasingUid !== null && <ReleaseModal      uid={releasingUid} onClose={close} />}
    </>
  );
}
