"""Structured resume builder: JSON → LaTeX → PDF, plus AI bullet enhancement."""
import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, Response

from app.schemas.resume_builder import EnhanceRequest, ResumeBuilderPayload
from app.services.resume_enhance import enhance_resume_bullet
from app.services.resume_latex import render_full_tex
from app.services.resume_pdf import compile_latex_to_pdf
from app.services.resume_pdf_fpdf import build_resume_pdf_fpdf

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/generate")
async def generate_resume_pdf(payload: ResumeBuilderPayload):
    """
    Validate structured resume JSON, render LaTeX, compile PDF when pdflatex exists.
    Returns application/pdf on success; otherwise JSON with LaTeX and error detail.
    """

    try:
        tex = render_full_tex(payload)
    except Exception as e:
        logger.exception("LaTeX render failed")
        raise HTTPException(status_code=500, detail=f"LaTeX generation failed: {e}")

    pdf_bytes, err = compile_latex_to_pdf(tex)
    if pdf_bytes:
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": 'inline; filename="resume.pdf"',
                "Cache-Control": "no-store",
                "X-Valen-Pdf-Source": "pdflatex",
            },
        )

    # No pdflatex (typical on Windows / Render): build PDF with fpdf2 so preview works.
    try:
        fallback_pdf = build_resume_pdf_fpdf(payload)
        return Response(
            content=fallback_pdf,
            media_type="application/pdf",
            headers={
                "Content-Disposition": 'inline; filename="resume.pdf"',
                "Cache-Control": "no-store",
                "X-Valen-Pdf-Source": "fpdf2",
            },
        )
    except Exception as fb_err:
        logger.warning("fpdf2 fallback failed: %s (pdflatex error was: %s)", fb_err, err)
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": err or "PDF compilation unavailable",
                "fallback_error": str(fb_err),
                "latex": tex,
            },
        )


@router.post("/enhance")
async def enhance_resume_text(body: EnhanceRequest):
    """Improve a single resume bullet or short paragraph via OpenAI or Gemini."""
    try:
        improved = enhance_resume_bullet(body.text)
        return {"success": True, "text": improved}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("enhance_resume_text")
        raise HTTPException(status_code=500, detail=str(e))
