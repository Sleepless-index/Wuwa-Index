import { useState } from 'react';
import Modal, { ModalHeader, ModalBody, ModalFooter, ModalBtn } from './Modal';
import { useTrackerStore } from '@/store/trackerStore';
import { importGachaHistory } from '@/utils/gachaImport';

type Step = 'input' | 'loading' | 'done' | 'error';

export default function GachaImportModal({ onClose }: { onClose: () => void }) {
  const applyGachaImport = useTrackerStore(s => s.applyGachaImport);

  const [url,      setUrl]      = useState('');
  const [step,     setStep]     = useState<Step>('input');
  const [errorMsg, setErrorMsg] = useState('');
  const [summary,  setSummary]  = useState<{ chars: number; total: number; limitedPity: number; standardPity: number } | null>(null);

  const handleImport = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setStep('loading');
    setErrorMsg('');

    try {
      const result = await importGachaHistory(trimmed);
      applyGachaImport(result);
      setSummary({
        chars:        Object.keys(result.copies).length,
        total:        result.totalFetched,
        limitedPity:  result.limitedPity,
        standardPity: result.standardPity,
      });
      setStep('done');
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof Error ? err.message : 'Unknown error. Make sure your URL is valid and not expired.'
      );
      setStep('error');
    }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Import from Game" />
      <ModalBody>

        {/* ── HOW TO GET URL ── */}
        {step === 'input' && (
          <>
            <div className="rounded-lg p-3 mb-4 text-xs"
              style={{ background: 'rgba(76,123,214,0.06)', border: '1px solid rgba(76,123,214,0.15)' }}>
              <p className="font-semibold mb-2" style={{ color: 'rgba(76,123,214,0.9)' }}>
                How to get your gacha URL
              </p>
              <ol className="space-y-1.5 text-subtext list-decimal list-inside">
                <li>Open Wuthering Waves and go to <span className="text-text font-medium">Convene → History</span></li>
                <li>Wait for the history to fully load</li>
                <li>
                  Navigate to your game folder and open:<br />
                  <code className="text-[10px] px-1 py-0.5 rounded mt-0.5 inline-block"
                    style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(76,123,214,0.8)' }}>
                    Client\Saved\Logs\Client.log
                  </code>
                </li>
                <li>Search for <code className="text-[10px] px-1 rounded" style={{ background: 'rgba(0,0,0,0.3)' }}>gacha-record</code> and copy the full URL</li>
              </ol>
            </div>

            <label className="text-xs font-medium text-subtext block mb-1.5">
              Paste your gacha URL
            </label>
            <textarea
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://aki-gm-resources-oversea.aki-game.net/aki/gacha/index.html#/record?..."
              rows={4}
              className="w-full resize-none text-xs font-mono bg-surface2 border border-border rounded-lg p-3 text-text placeholder:text-muted outline-none focus:border-accent transition-colors"
            />
            <p className="text-[10px] text-muted mt-1.5">
              The URL expires after ~1 hour. Your data stays private — it&apos;s only used to fetch your pull history.
            </p>
          </>
        )}

        {/* ── LOADING ── */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(76,123,214,0.3)', borderTopColor: '#4c7bd6' }} />
            <p className="text-sm text-subtext">Fetching your pull history…</p>
            <p className="text-xs text-muted">This may take a moment if you have many pulls.</p>
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && summary && (
          <div className="flex flex-col items-center py-6 gap-4">
            {/* Check icon */}
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(76,214,130,0.1)', border: '1px solid rgba(76,214,130,0.3)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="rgba(76,214,130,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-text">Import successful!</p>

            {/* Stats grid */}
            <div className="w-full grid grid-cols-2 gap-2">
              {[
                { label: 'Characters found', value: summary.chars },
                { label: 'Total pulls read',  value: summary.total },
                { label: 'Limited pity',      value: `${summary.limitedPity} pulls` },
                { label: 'Standard pity',     value: `${summary.standardPity} pulls` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <p className="text-lg font-mono font-bold text-text">{value}</p>
                  <p className="text-[10px] text-muted mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-subtext text-center">
              Owned characters, sequences, pull counts and pity have all been updated.
            </p>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === 'error' && (
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(214,76,76,0.1)', border: '1px solid rgba(214,76,76,0.3)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="rgba(214,76,76,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-text">Import failed</p>
            <p className="text-xs text-subtext text-center max-w-xs">{errorMsg}</p>
            <button
              onClick={() => setStep('input')}
              className="text-xs px-3 py-1.5 rounded-lg border transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--subtext)' }}
            >
              Try again
            </button>
          </div>
        )}

      </ModalBody>

      <ModalFooter>
        {step === 'input' && (
          <>
            <ModalBtn primary onClick={handleImport} disabled={!url.trim()}>
              Import
            </ModalBtn>
            <ModalBtn onClick={onClose}>Cancel</ModalBtn>
          </>
        )}
        {step === 'done' && (
          <ModalBtn primary onClick={onClose}>Done</ModalBtn>
        )}
        {step === 'error' && (
          <ModalBtn onClick={onClose}>Close</ModalBtn>
        )}
      </ModalFooter>
    </Modal>
  );
}
