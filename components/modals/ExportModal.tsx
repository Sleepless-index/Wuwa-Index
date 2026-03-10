import { useState } from 'react';
import Modal, { ModalHeader, ModalBody, ModalFooter, ModalBtn } from './Modal';
import { useTrackerStore } from '@/store/trackerStore';

export default function ExportModal({ onClose }: { onClose: () => void }) {
  const storeState      = useTrackerStore(s => s.state);
  const priority        = useTrackerStore(s => s.priority);
  const upcoming        = useTrackerStore(s => s.upcoming);
  const releasedUpcoming = useTrackerStore(s => s.releasedUpcoming);
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify({ state: storeState, priority, upcoming, releasedUpcoming }, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Export Data" />
      <ModalBody>
        <p className="text-sm text-subtext mb-3">
          Copy the text below and save it somewhere safe. Paste it back using Import to restore your progress.
        </p>
        <textarea
          readOnly
          value={json}
          className="
            w-full h-48 resize-none text-xs font-mono bg-surface2 border border-border
            rounded-lg p-3 text-text outline-none select-all
          "
        />
        {copied && <p className="text-xs text-got font-mono mt-1">Copied!</p>}
      </ModalBody>
      <ModalFooter>
        <ModalBtn primary onClick={handleCopy}>{copied ? '✓ Copied' : 'Copy to clipboard'}</ModalBtn>
        <ModalBtn onClick={onClose}>Close</ModalBtn>
      </ModalFooter>
    </Modal>
  );
}
