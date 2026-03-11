import { useState } from 'react';
import Modal, { ModalHeader, ModalBody, ModalFooter, ModalBtn } from './Modal';
import { useTrackerStore } from '@/store/trackerStore';

export default function ImportModal({ onClose }: { onClose: () => void }) {
  const importData = useTrackerStore(s => s.importData);
  const [raw, setRaw]   = useState('');
  const [msg, setMsg]   = useState('');
  const [ok,  setOk]    = useState(false);

  const handleImport = () => {
    const err = importData(raw);
    if (err) {
      setMsg(err); setOk(false);
    } else {
      setMsg('Import successful!'); setOk(true);
      setTimeout(onClose, 1200);
    }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Import Data" />
      <ModalBody>
        <p className="text-sm text-subtext mb-3">
          Paste your previously exported data below. This will overwrite your current progress.
        </p>
        <textarea
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder="Paste exported data here..."
          className="
            w-full h-48 resize-none text-xs font-mono bg-surface2 border border-border
            rounded-lg p-3 text-text placeholder:text-muted outline-none
            focus:border-accent transition-colors
          "
        />
        {msg && (
          <p className={`text-xs font-mono mt-1 ${ok ? 'text-got' : 'text-havoc'}`}>{msg}</p>
        )}
      </ModalBody>
      <ModalFooter>
        <ModalBtn primary onClick={handleImport}>Import</ModalBtn>
        <ModalBtn onClick={onClose}>Cancel</ModalBtn>
      </ModalFooter>
    </Modal>
  );
}
