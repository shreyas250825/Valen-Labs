import { Sparkles, Loader2 } from "lucide-react";

interface InputBoxProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
  multiline?: boolean;
  rows?: number;
  id?: string;
  onEnhance?: () => void;
  enhancing?: boolean;
  disabledEnhance?: boolean;
  /** When true, Enhance is not disabled for empty text (e.g. placeholder / no-op handler). */
  enhanceAllowEmpty?: boolean;
}

export default function InputBox({
  label,
  value,
  onChange,
  maxLength,
  multiline,
  rows = 3,
  id,
  onEnhance,
  enhancing,
  disabledEnhance,
  enhanceAllowEmpty,
}: InputBoxProps) {
  const common =
    "w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs uppercase tracking-wider text-slate-500">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600">
            {value.length}/{maxLength}
          </span>
          {onEnhance && (
            <button
              type="button"
              onClick={onEnhance}
              disabled={
                disabledEnhance ||
                enhancing ||
                (!enhanceAllowEmpty && !value.trim())
              }
              className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-300 hover:bg-purple-500/20 disabled:opacity-40 disabled:pointer-events-none"
            >
              {enhancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              Enhance with AI
            </button>
          )}
        </div>
      </div>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          maxLength={maxLength}
          rows={rows}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          className={common}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          className={common}
        />
      )}
    </div>
  );
}
