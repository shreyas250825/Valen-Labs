"""Build resume PDF without LaTeX (fallback when pdflatex is not installed)."""
from __future__ import annotations

import logging

from app.schemas.resume_builder import ResumeBuilderPayload

logger = logging.getLogger(__name__)


def _safe(txt: str) -> str:
    if not txt:
        return ""
    t = str(txt).replace("\r\n", "\n").replace("\r", "\n")
    # Core Helvetica is latin-1; normalize common Unicode punctuation
    for a, b in (
        ("\u2022", "-"),  # bullet
        ("\u2013", "-"),
        ("\u2014", "-"),
        ("\u2018", "'"),
        ("\u2019", "'"),
        ("\u201c", '"'),
        ("\u201d", '"'),
        ("\u00a0", " "),
    ):
        t = t.replace(a, b)
    return t.encode("latin-1", errors="replace").decode("latin-1")


def build_resume_pdf_fpdf(payload: ResumeBuilderPayload) -> bytes:
    try:
        from fpdf import FPDF
    except ImportError as e:
        raise RuntimeError("fpdf2 is not installed; pip install fpdf2") from e

    b = payload.basics
    e = payload.education
    s = payload.skills

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=14)
    pdf.add_page()
    pdf.set_margins(14, 14, 14)

    # w=0 with multi_cell breaks when x is past the margin; use epw + reset x.
    def _w() -> float:
        return float(pdf.epw)

    def h1(text: str) -> None:
        pdf.set_x(pdf.l_margin)
        pdf.set_font("helvetica", "B", 18)
        pdf.multi_cell(_w(), 9, _safe(text))
        pdf.ln(1)

    def h2(text: str) -> None:
        pdf.set_x(pdf.l_margin)
        pdf.set_font("helvetica", "B", 12)
        pdf.set_text_color(40, 40, 40)
        pdf.multi_cell(_w(), 7, _safe(text))
        pdf.set_draw_color(120, 120, 120)
        pdf.set_line_width(0.3)
        y = pdf.get_y()
        pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y)
        pdf.ln(3)
        pdf.set_text_color(0, 0, 0)

    def body(text: str, size: int = 10) -> None:
        pdf.set_x(pdf.l_margin)
        pdf.set_font("helvetica", "", size)
        pdf.multi_cell(_w(), 5, _safe(text))
        pdf.ln(1)

    def small(text: str) -> None:
        body(text, 9)

    # --- Header ---
    name = (b.name or "Your Name").strip() or "Your Name"
    h1(name)

    pdf.set_font("helvetica", "", 10)
    contact_bits = []
    if b.email.strip():
        contact_bits.append(f"Email: {b.email.strip()}")
    if b.phone.strip():
        contact_bits.append(f"Mobile: {b.phone.strip()}")
    if b.github.strip():
        contact_bits.append(f"GitHub: {b.github.strip()}")
    if b.portfolio.strip():
        contact_bits.append(f"Portfolio: {b.portfolio.strip()}")
    if contact_bits:
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(_w(), 5, _safe("  |  ".join(contact_bits)))
    pdf.ln(4)

    # --- Education ---
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
        h2("Education")
        line1 = "  ".join(
            x
            for x in [
                e.college.strip(),
                e.location.strip(),
            ]
            if x
        )
        if line1:
            pdf.set_x(pdf.l_margin)
            pdf.set_font("helvetica", "B", 10)
            pdf.multi_cell(_w(), 5, _safe(line1))
        deg = e.degree.strip()
        if e.gpa.strip():
            deg = f"{deg};  GPA: {e.gpa.strip()}" if deg else f"GPA: {e.gpa.strip()}"
        if deg or e.duration.strip():
            pdf.set_x(pdf.l_margin)
            pdf.set_font("helvetica", "I", 9)
            left = deg or ""
            right = e.duration.strip() or ""
            pdf.multi_cell(_w(), 5, _safe(f"{left}    {right}".strip()))
        if e.courses.strip():
            small(f"Courses: {e.courses.strip()}")
        pdf.ln(2)

    # --- Skills ---
    if any(
        [
            s.languages.strip(),
            s.frameworks.strip(),
            s.tools.strip(),
            s.platforms.strip(),
            s.soft_skills.strip(),
        ]
    ):
        h2("Skills Summary")
        if s.languages.strip():
            small(f"Languages: {s.languages.strip()}")
        if s.frameworks.strip():
            small(f"Frameworks: {s.frameworks.strip()}")
        if s.tools.strip():
            small(f"Tools: {s.tools.strip()}")
        if s.platforms.strip():
            small(f"Platforms: {s.platforms.strip()}")
        if s.soft_skills.strip():
            small(f"Soft skills: {s.soft_skills.strip()}")
        pdf.ln(2)

    # --- Experience ---
    if payload.experience:
        nonempty = [
            ex
            for ex in payload.experience
            if any(
                [
                    ex.company.strip(),
                    ex.role.strip(),
                    ex.location.strip(),
                    ex.duration.strip(),
                    ex.bullet1.strip(),
                    ex.bullet2.strip(),
                    ex.bullet3.strip(),
                ]
            )
        ]
        if nonempty:
            h2("Experience")
            for ex in nonempty:
                pdf.set_x(pdf.l_margin)
                pdf.set_font("helvetica", "B", 10)
                pdf.multi_cell(_w(), 5, _safe(ex.company.strip() or "Role"))
                pdf.set_x(pdf.l_margin)
                pdf.set_font("helvetica", "I", 9)
                sub = "  ".join(
                    x for x in [ex.role.strip(), ex.location.strip(), ex.duration.strip()] if x
                )
                if sub:
                    pdf.multi_cell(_w(), 5, _safe(sub))
                pdf.set_font("helvetica", "", 9)
                for bl in (ex.bullet1, ex.bullet2, ex.bullet3):
                    if bl and bl.strip():
                        pdf.set_x(pdf.l_margin)
                        pdf.multi_cell(_w(), 5, _safe(f"- {bl.strip()}"))
                pdf.ln(2)

    # --- Projects ---
    if payload.projects:
        items = [
            p
            for p in payload.projects
            if (p.title_tech.strip() or p.description.strip())
        ]
        if items:
            h2("Projects")
            for p in items:
                if p.title_tech.strip():
                    pdf.set_x(pdf.l_margin)
                    pdf.set_font("helvetica", "B", 10)
                    pdf.multi_cell(_w(), 5, _safe(p.title_tech.strip()))
                if p.description.strip():
                    pdf.set_x(pdf.l_margin)
                    pdf.set_font("helvetica", "", 9)
                    pdf.multi_cell(_w(), 5, _safe(p.description.strip()))
                pdf.ln(2)

    # --- Achievements ---
    ach = [a for a in payload.achievements if a and str(a).strip()]
    if ach:
        h2("Honors and Awards")
        pdf.set_font("helvetica", "", 9)
        for a in ach:
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(_w(), 5, _safe(f"- {str(a).strip()}"))
        pdf.ln(2)

    # --- Volunteer ---
    if payload.volunteer:
        vols = [
            v
            for v in payload.volunteer
            if any(
                [
                    v.role_org.strip(),
                    v.location.strip(),
                    v.description.strip(),
                    v.duration.strip(),
                ]
            )
        ]
        if vols:
            h2("Volunteer Experience")
            for v in vols:
                pdf.set_x(pdf.l_margin)
                pdf.set_font("helvetica", "B", 10)
                pdf.multi_cell(_w(), 5, _safe(v.role_org.strip() or "Volunteer"))
                pdf.set_x(pdf.l_margin)
                pdf.set_font("helvetica", "I", 9)
                sub = "  ".join(
                    x for x in [v.location.strip(), v.duration.strip()] if x
                )
                if sub:
                    pdf.multi_cell(_w(), 5, _safe(sub))
                if v.description.strip():
                    pdf.set_x(pdf.l_margin)
                    pdf.set_font("helvetica", "", 9)
                    pdf.multi_cell(_w(), 5, _safe(v.description.strip()))
                pdf.ln(2)

    out = pdf.output(dest="S")
    if isinstance(out, str):
        return out.encode("latin-1", errors="replace")
    return bytes(out)
