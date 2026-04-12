/**
 * Client-side LaTeX escaping (mirrors backend rules) for downloads / validation messages.
 * PDF is generated on the server; keep this in sync with `backend/app/services/resume_latex.py`.
 */
export function escapeLatex(text: string): string {
  if (!text) return "";
  let out = "";
  for (const ch of String(text)) {
    switch (ch) {
      case "\\":
        out += "\\textbackslash{}";
        break;
      case "&":
        out += "\\&";
        break;
      case "%":
        out += "\\%";
        break;
      case "$":
        out += "\\$";
        break;
      case "#":
        out += "\\#";
        break;
      case "_":
        out += "\\_";
        break;
      case "{":
        out += "\\{";
        break;
      case "}":
        out += "\\}";
        break;
      case "~":
        out += "\\textasciitilde{}";
        break;
      case "^":
        out += "\\textasciicircum{}";
        break;
      default:
        out += ch;
    }
  }
  return out;
}

export function clampField(value: string, max: number): string {
  return value.slice(0, max);
}
