import Editor from "@monaco-editor/react";
import type { EditorLanguage } from "../../types/arena";
import { MONACO_LANGUAGE_MAP } from "../../data/arena/problems";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: EditorLanguage;
  readOnly?: boolean;
  height?: string;
}

const CodeEditor = ({
  value,
  onChange,
  language,
  readOnly = false,
  height = "100%",
}: CodeEditorProps) => (
  <div className="h-full min-h-[200px] rounded-lg overflow-hidden border border-white/5">
    <Editor
      height={height}
      language={MONACO_LANGUAGE_MAP[language] ?? "python"}
      theme="vs-dark"
      value={value}
      onChange={(v: string | undefined) => onChange(v ?? "")}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 12, bottom: 12 },
        tabSize: 2,
        wordWrap: "on",
        renderLineHighlight: "line",
        cursorBlinking: "smooth",
        smoothScrolling: true,
      }}
      loading={
        <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-slate-400 text-sm">
          Loading editor...
        </div>
      }
    />
  </div>
);

export default CodeEditor;
