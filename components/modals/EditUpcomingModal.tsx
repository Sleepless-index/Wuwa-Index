import { useState, useEffect } from 'react';
import Modal, { ModalHeader, ModalBody, ModalFooter, ModalBtn } from './Modal';
import { useTrackerStore } from '@/store/trackerStore';

const ELEMENTS = ['', 'Spectro', 'Aero', 'Glacio', 'Fusion', 'Electro', 'Havoc'];

interface Props {
  uid:     number;
  onClose: () => void;
}

export default function EditUpcomingModal({ uid, onClose }: Props) {
  const upcoming    = useTrackerStore(s => s.upcoming);
  const editUpcoming = useTrackerStore(s => s.editUpcoming);
  const entry       = upcoming.find(u => u.uid === uid);

  const [name, setName]       = useState(entry?.name ?? '');
  const [element, setElement] = useState(entry?.element ?? '');

  useEffect(() => {
    setName(entry?.name ?? '');
    setElement(entry?.element ?? '');
  }, [entry]);

  const handleSave = () => {
    if (!name.trim()) return;
    editUpcoming(uid, name.trim(), element);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Edit Upcoming" accent="text-upcoming" />
      <ModalBody>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-mono text-subtext">Name</span>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
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
        <ModalBtn primary onClick={handleSave}>Save</ModalBtn>
        <ModalBtn onClick={onClose}>Cancel</ModalBtn>
      </ModalFooter>
    </Modal>
  );
}
