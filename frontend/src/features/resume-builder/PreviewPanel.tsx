import { Loader2, AlertCircle, Download } from "lucide-react";

interface PreviewPanelProps {
  pdfUrl: string | null;
  loading: boolean;
  error: string | null;
  latexFallback: string | null;
  onDownloadTex?: () => void;
}

export default function PreviewPanel({
  pdfUrl,
  loading,
  error,
  latexFallback,
  onDownloadTex,
}: PreviewPanelProps) {
  return (
    <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden min-h-[480px] flex flex-col">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Live PDF preview</h3>
        {loading && (
          <span className="flex items-center gap-2 text-xs text-purple-300">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating…
          </span>
        )}
      </div>

      {error && (
        <div className="m-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 flex gap-2 items-start">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p>{error}</p>
            {latexFallback && onDownloadTex && (
              <button
                type="button"
                onClick={onDownloadTex}
                className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-medium hover:bg-white/15"
              >
                <Download className="h-3 w-3" />
                Download .tex
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 bg-slate-900/50 min-h-[420px]">
        {pdfUrl ? (
          <iframe
            title="Resume PDF preview"
            src={pdfUrl}
            className="w-full h-full min-h-[420px] border-0"
          />
        ) : !loading && !error ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm px-6 text-center">
            Fill the form — preview refreshes automatically after you stop typing (2s).
          </div>
        ) : null}
      </div>
    </div>
  );
}
