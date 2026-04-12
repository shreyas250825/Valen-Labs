import { Trash2 } from "lucide-react";
import type { VolunteerItem } from "./types";
import { LIMITS } from "./types";
import InputBox from "./InputBox";

interface Props {
  index: number;
  item: VolunteerItem;
  onChange: (next: VolunteerItem) => void;
  onRemove: () => void;
}

export default function VolunteerBlock({ index, item, onChange, onRemove }: Props) {
  const L = LIMITS.volunteer;
  const set = (patch: Partial<VolunteerItem>) => onChange({ ...item, ...patch });
  const base = `vol-${index}`;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Volunteer {index + 1}</h4>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
          aria-label="Remove volunteer entry"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <InputBox
        label="Role + organization"
        id={`${base}-ro`}
        value={item.roleOrg}
        onChange={(v) => set({ roleOrg: v })}
        maxLength={L.roleOrg}
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <InputBox
          label="Location"
          id={`${base}-loc`}
          value={item.location}
          onChange={(v) => set({ location: v })}
          maxLength={L.location}
        />
        <InputBox
          label="Duration"
          id={`${base}-dur`}
          value={item.duration}
          onChange={(v) => set({ duration: v })}
          maxLength={L.duration}
        />
      </div>
      <InputBox
        label="Description"
        id={`${base}-desc`}
        value={item.description}
        onChange={(v) => set({ description: v })}
        maxLength={L.description}
        multiline
        rows={3}
      />
    </div>
  );
}
