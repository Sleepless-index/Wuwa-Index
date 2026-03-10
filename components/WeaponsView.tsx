import { SIG_WEAPONS, STD_WEAPONS } from '@/data/weapons';
import WeaponEntry from './WeaponEntry';

export default function WeaponsView() {
  return (
    <div className="px-4 py-4">
      <p className="text-[10px] font-mono font-semibold text-subtext uppercase tracking-widest mb-3">
        Signature Weapons
      </p>
      <div className="card-grid flex flex-wrap gap-2 mb-8">
        {SIG_WEAPONS.map(w => <WeaponEntry key={w.file} weapon={w} />)}
      </div>

      <p className="text-[10px] font-mono font-semibold text-subtext uppercase tracking-widest mb-3">
        Standard Weapons
      </p>
      <div className="card-grid flex flex-wrap gap-2">
        {STD_WEAPONS.map(w => <WeaponEntry key={w.file} weapon={w} />)}
      </div>
    </div>
  );
}
