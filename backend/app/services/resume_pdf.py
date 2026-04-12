"""Compile LaTeX to PDF when pdflatex is available on the host."""
from __future__ import annotations

import logging
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, Tuple

logger = logging.getLogger(__name__)


def find_pdflatex() -> Optional[str]:
    return shutil.which("pdflatex")


def compile_latex_to_pdf(tex_source: str, timeout_sec: int = 90) -> Tuple[Optional[bytes], Optional[str]]:
    """
    Run pdflatex in a temp directory. Returns (pdf_bytes, error_message).
    """
    binary = find_pdflatex()
    if not binary:
        return None, "pdflatex not found on server; install TeX Live or compile locally"

    work = Path(tempfile.mkdtemp(prefix="valen_resume_"))
    tex_path = work / "resume.tex"
    try:
        tex_path.write_text(tex_source, encoding="utf-8")
        cmd = [
            binary,
            "-interaction=nonstopmode",
            "-halt-on-error",
            f"-output-directory={work}",
            str(tex_path),
        ]
        for _ in range(2):
            proc = subprocess.run(
                cmd,
                cwd=str(work),
                capture_output=True,
                text=True,
                timeout=timeout_sec,
            )
            if proc.returncode != 0:
                tail = (proc.stdout or "")[-2000:] + "\n" + (proc.stderr or "")[-2000:]
                logger.warning("pdflatex failed: %s", tail)
                return None, f"pdflatex failed (exit {proc.returncode})"

        pdf_path = work / "resume.pdf"
        if not pdf_path.is_file():
            return None, "pdflatex produced no PDF file"

        data = pdf_path.read_bytes()
        return data, None
    except subprocess.TimeoutExpired:
        return None, "pdflatex timed out"
    except Exception as e:
        logger.exception("compile_latex_to_pdf")
        return None, str(e)
    finally:
        try:
            shutil.rmtree(work, ignore_errors=True)
        except OSError:
            pass
