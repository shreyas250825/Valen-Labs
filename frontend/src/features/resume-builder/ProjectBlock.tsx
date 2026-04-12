import { Trash2 } from "lucide-react";
import type { ProjectItem } from "./types";
import { LIMITS } from "./types";
import InputBox from "./InputBox";

interface Props {
  index: number;
  item: ProjectItem;
  onChange: (next: ProjectItem) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function ProjectBlock({
  index,
  item,
  onChange,
  onRemove,
  canRemove,
}: Props) {
  const L = LIMITS.project;
  const set = (patch: Partial<ProjectItem>) => onChange({ ...item, ...patch });
  const base = `proj-${index}`;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Project {index + 1}</h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
            aria-label="Remove project"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <InputBox
        label="Title + tech stack"
        id={`${base}-title`}
        value={item.titleTech}
        onChange={(v) => set({ titleTech: v })}
        maxLength={L.titleTech}
      />
      <InputBox
        label="Description"
        id={`${base}-desc`}
        value={item.description}
        onChange={(v) => set({ description: v })}
        maxLength={L.description}
        multiline
        rows={4}
      />
    </div>
  );
}
