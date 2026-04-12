"""Map structured resume JSON to LaTeX (escape + sections)."""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List

from app.schemas.resume_builder import ResumeBuilderPayload

TEMPLATE_PATH = Path(__file__).resolve().parent.parent.parent / "latex" / "resumeTemplate.tex"


def escape_latex(text: str) -> str:
    if not text:
        return ""
    out = []
    for ch in str(text):
        if ch == "\\":
            out.append(r"\textbackslash{}")
        elif ch == "&":
            out.append(r"\&")
        elif ch == "%":
            out.append(r"\%")
        elif ch == "$":
            out.append(r"\$")
        elif ch == "#":
            out.append(r"\#")
        elif ch == "_":
            out.append(r"\_")
        elif ch == "{":
            out.append(r"\{")
        elif ch == "}":
            out.append(r"\}")
        elif ch == "~":
            out.append(r"\textasciitilde{}")
        elif ch == "^":
            out.append(r"\textasciicircum{}")
        else:
            out.append(ch)
    return "".join(out)


def _lines(parts: List[str]) -> str:
    return "\n".join(p for p in parts if p)


def build_content_from_payload(data: ResumeBuilderPayload) -> str:
    b = data.basics
    e = data.education
    s = data.skills
    chunks: List[str] = []

    # Header
    name = escape_latex(b.name.strip() or "Your Name")
    chunks.append(f"{{\\Large\\bfseries {name}}}\\\\")
    meta: List[str] = []
    if b.email.strip():
        meta.append(escape_latex(b.email.strip()))
    if b.phone.strip():
        meta.append(escape_latex(b.phone.strip()))
    if b.github.strip():
        gh = b.github.strip()
        esc = escape_latex(gh)
        if gh.startswith("http"):
            meta.append(f"\\href{{{esc}}}{{\\texttt{{GitHub}}}}")
        else:
            meta.append(esc)
    if b.portfolio.strip():
        po = b.portfolio.strip()
        esc = escape_latex(po)
        if po.startswith("http"):
            meta.append(f"\\href{{{esc}}}{{\\texttt{{Portfolio}}}}")
        else:
            meta.append(esc)
    if meta:
        chunks.append(" \\textbar\\ ".join(meta) + "\\\\")
    chunks.append("\\vspace{0.4em}\\hrule\\vspace{0.6em}")

    # Education
    if any(
        [
            e.college.strip(),
            e.degree.strip(),
            e.location.strip(),
            e.duration.strip(),
            e.gpa.strip(),
            e.courses.strip(),
        ]
    ):
        chunks.append("\\section*{Education}")
        line = []
        if e.college.strip():
            line.append(f"\\textbf{{{escape_latex(e.college.strip())}}}")
        if e.location.strip():
            line.append(escape_latex(e.location.strip()))
        if e.duration.strip():
            line.append(f"\\hfill \\textit{{{escape_latex(e.duration.strip())}}}")
        if line:
            chunks.append("".join(line) + "\\\\")
        if e.degree.strip():
            chunks.append(f"\\textit{{{escape_latex(e.degree.strip())}}}" + "\\\\")
        if e.gpa.strip():
            chunks.append(f"GPA: {escape_latex(e.gpa.strip())}\\\\")
        if e.courses.strip():
            chunks.append(f"\\textbf{{Relevant coursework:}} {escape_latex(e.courses.strip())}\\\\")
        chunks.append("")

    # Skills
    if any(
        [
            s.languages.strip(),
            s.frameworks.strip(),
            s.tools.strip(),
            s.platforms.strip(),
            s.soft_skills.strip(),
        ]
    ):
        chunks.append("\\section*{Skills}")
        if s.languages.strip():
            chunks.append(f"\\textbf{{Languages:}} {escape_latex(s.languages.strip())}\\\\")
        if s.frameworks.strip():
            chunks.append(f"\\textbf{{Frameworks:}} {escape_latex(s.frameworks.strip())}\\\\")
        if s.tools.strip():
            chunks.append(f"\\textbf{{Tools:}} {escape_latex(s.tools.strip())}\\\\")
        if s.platforms.strip():
            chunks.append(f"\\textbf{{Platforms:}} {escape_latex(s.platforms.strip())}\\\\")
        if s.soft_skills.strip():
            chunks.append(f"\\textbf{{Soft skills:}} {escape_latex(s.soft_skills.strip())}\\\\")
        chunks.append("")

    # Experience
    if data.experience:
        chunks.append("\\section*{Experience}")
        for ex in data.experience:
            if not any(
                [
                    ex.company.strip(),
                    ex.role.strip(),
                    ex.location.strip(),
                    ex.duration.strip(),
                    ex.bullet1.strip(),
                    ex.bullet2.strip(),
                    ex.bullet3.strip(),
                ]
            ):
                continue
            head = []
            if ex.company.strip():
                head.append(f"\\textbf{{{escape_latex(ex.company.strip())}}}")
            if ex.role.strip():
                head.append(escape_latex(ex.role.strip()))
            if ex.location.strip():
                head.append(escape_latex(ex.location.strip()))
            row = " \\textbar\\ ".join(head) if head else ""
            if ex.duration.strip():
                row += f" \\hfill \\textit{{{escape_latex(ex.duration.strip())}}}"
            if row.strip():
                chunks.append(row + "\\\\")
            bullets = [ex.bullet1, ex.bullet2, ex.bullet3]
            nonempty = [bl for bl in bullets if bl and bl.strip()]
            if nonempty:
                chunks.append("\\begin{itemize}")
                for bl in nonempty[:3]:
                    chunks.append(f"\\item {escape_latex(bl.strip())}")
                chunks.append("\\end{itemize}")
            chunks.append("\\vspace{0.25em}")
        chunks.append("")

    # Projects
    if data.projects:
        chunks.append("\\section*{Projects}")
        for pr in data.projects:
            if not (pr.title_tech.strip() or pr.description.strip()):
                continue
            if pr.title_tech.strip():
                chunks.append(f"\\textbf{{{escape_latex(pr.title_tech.strip())}}}\\\\")
            if pr.description.strip():
                chunks.append(f"{escape_latex(pr.description.strip())}\\\\")
            chunks.append("\\vspace{0.2em}")
        chunks.append("")

    # Achievements
    if data.achievements:
        chunks.append("\\section*{Achievements}")
        chunks.append("\\begin{itemize}")
        for a in data.achievements:
            if a.strip():
                chunks.append(f"\\item {escape_latex(a.strip())}")
        chunks.append("\\end{itemize}")
        chunks.append("")

    # Volunteer
    if data.volunteer:
        chunks.append("\\section*{Volunteer Experience}")
        for v in data.volunteer:
            if not any(
                [v.role_org.strip(), v.location.strip(), v.description.strip(), v.duration.strip()]
            ):
                continue
            parts = []
            if v.role_org.strip():
                parts.append(f"\\textbf{{{escape_latex(v.role_org.strip())}}}")
            if v.location.strip():
                parts.append(escape_latex(v.location.strip()))
            line = " \\textbar\\ ".join(parts)
            if v.duration.strip():
                line += f" \\hfill \\textit{{{escape_latex(v.duration.strip())}}}"
            chunks.append(line + "\\\\")
            if v.description.strip():
                chunks.append(escape_latex(v.description.strip()) + "\\\\")
            chunks.append("\\vspace{0.2em}")

    return _lines(chunks)


def render_full_tex(payload: ResumeBuilderPayload) -> str:
    content = build_content_from_payload(payload)
    raw = TEMPLATE_PATH.read_text(encoding="utf-8")
    marker = "{{CONTENT}}"
    if raw.count(marker) != 1:
        raise ValueError("resumeTemplate.tex must contain exactly one {{CONTENT}} placeholder")
    return raw.replace(marker, content)


def payload_from_dict(d: Dict[str, Any]) -> ResumeBuilderPayload:
    return ResumeBuilderPayload.parse_obj(d)
