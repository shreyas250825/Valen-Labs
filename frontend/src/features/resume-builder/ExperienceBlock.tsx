import { Trash2 } from "lucide-react";
import type { ExperienceItem } from "./types";
import { LIMITS } from "./types";
import InputBox from "./InputBox";

interface Props {
  index: number;
  item: ExperienceItem;
  onChange: (next: ExperienceItem) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function ExperienceBlock({
  index,
  item,
  onChange,
  onRemove,
  canRemove,
}: Props) {
  const L = LIMITS.experience;
  const set = (patch: Partial<ExperienceItem>) => onChange({ ...item, ...patch });
  const base = `exp-${index}`;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Experience {index + 1}</h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
            aria-label="Remove experience"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <InputBox
          label="Company"
          id={`${base}-company`}
          value={item.company}
          onChange={(v) => set({ company: v })}
          maxLength={L.company}
        />
        <InputBox
          label="Location"
          id={`${base}-loc`}
          value={item.location}
          onChange={(v) => set({ location: v })}
          maxLength={L.location}
        />
        <InputBox
          label="Role"
          id={`${base}-role`}
          value={item.role}
          onChange={(v) => set({ role: v })}
          maxLength={L.role}
        />
        <InputBox
          label="Duration"
          id={`${base}-dur`}
          value={item.duration}
          onChange={(v) => set({ duration: v })}
          maxLength={L.duration}
        />
      </div>
      <p className="text-[10px] uppercase tracking-wider text-slate-600">Bullets (max 3)</p>
      <InputBox
        label="Bullet 1"
        id={`${base}-b1`}
        value={item.bullet1}
        onChange={(v) => set({ bullet1: v })}
        maxLength={L.bullet}
        multiline
        rows={2}
      />
      <InputBox
        label="Bullet 2"
        id={`${base}-b2`}
        value={item.bullet2}
        onChange={(v) => set({ bullet2: v })}
        maxLength={L.bullet}
        multiline
        rows={2}
      />
      <InputBox
        label="Bullet 3"
        id={`${base}-b3`}
        value={item.bullet3}
        onChange={(v) => set({ bullet3: v })}
        maxLength={L.bullet}
        multiline
        rows={2}
      />
    </div>
  );
}
