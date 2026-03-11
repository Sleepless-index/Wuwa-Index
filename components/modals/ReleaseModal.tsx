import { useState, useEffect } from 'react';
import Modal, { ModalHeader, ModalBody, ModalFooter, ModalBtn } from './Modal';
import { useTrackerStore } from '@/store/trackerStore';

const ELEMENTS = ['', 'Spectro', 'Aero', 'Glacio', 'Fusion', 'Electro', 'Havoc'];

interface Props {
  uid:     number;
  onClose: () => void;
}

export default function ReleaseModal({ uid, onClose }: Props) {
  const upcoming       = useTrackerStore(s => s.upcoming);
  const releaseUpcoming = useTrackerStore(s => s.releaseUpcoming);
  const entry          = upcoming.find(u => u.uid === uid);

  const [name, setName]       = useState(entry?.name ?? '');
  const [element, setElement] = useState(entry?.element ?? '');

  useEffect(() => {
    setName(entry?.name ?? '');
    setElement(entry?.element ?? '');
  }, [entry]);

  const handleConfirm = () => {
    if (!name.trim()) return;
    releaseUpcoming(uid, name.trim(), element || 'Spectro');
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Mark as Released" accent="text-upcoming" />
      <ModalBody>
        <p className="text-sm text-subtext mb-4">
          Confirm or correct the details before moving to the main tracker.
        </p>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-mono text-subtext">Name</span>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
              className="text-sm bg-surface2 border border-border rounded-lg px-3 py-2 text-text outline-none focus:border-accent transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-mono text-subtext">Element</span>
            <select
              value={element}
              onChange={e => setElement(e.target.value)}
              className="text-sm bg-surface2 border border-border rounded-lg px-3 py-2 text-text outline-none focus:border-accent transition-colors cursor-pointer"
            >
              {ELEMENTS.map(el => <option key={el} value={el}>{el || 'Unknown'}</option>)}
            </select>
          </label>
        </div>
      </ModalBody>
      <ModalFooter>
        <ModalBtn primary onClick={handleConfirm}>Confirm &amp; move to tracker</ModalBtn>
        <ModalBtn onClick={onClose}>Cancel</ModalBtn>
      </ModalFooter>
    </Modal>
  );
}
