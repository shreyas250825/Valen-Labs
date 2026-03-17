import os
from functools import lru_cache

import requests


def required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing env var: {name}")
    return value


@lru_cache(maxsize=1)
def _cfg():
    url = required_env("SUPABASE_URL").rstrip("/")
    service_key = required_env("SUPABASE_SERVICE_ROLE_KEY")
    return url, service_key


def _headers(service_key: str, prefer: str | None = None, accept: str | None = None) -> dict:
    h = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
    if prefer:
        h["Prefer"] = prefer
    if accept:
        h["Accept"] = accept
    return h


def upsert_user(firebase_uid: str, email: str | None, name: str | None) -> None:
    url, key = _cfg()
    endpoint = f"{url}/rest/v1/users?on_conflict=firebase_uid"
    payload = {"firebase_uid": firebase_uid, "email": email, "name": name}
    r = requests.post(
        endpoint,
        headers=_headers(key, prefer="resolution=merge-duplicates,return=representation"),
        json=payload,
        timeout=15,
    )
    r.raise_for_status()


def insert_interview_session(payload: dict) -> dict:
    url, key = _cfg()
    endpoint = f"{url}/rest/v1/interview_sessions"
    r = requests.post(
        endpoint,
        headers=_headers(key, prefer="return=representation"),
        json=payload,
        timeout=15,
    )
    r.raise_for_status()
    data = r.json()
    return data[0] if isinstance(data, list) and data else {}


def get_interview_session_by_external_id(external_session_id: str) -> dict | None:
    """
    Lookup a Supabase interview session row by the external (in-memory) session id.
    """
    url, key = _cfg()
    endpoint = (
        f"{url}/rest/v1/interview_sessions"
        f"?select=id,firebase_uid,job_role,difficulty,external_session_id,started_at"
        f"&external_session_id=eq.{external_session_id}"
    )
    r = requests.get(
        endpoint,
        headers=_headers(key, accept="application/vnd.pgrst.object+json"),
        timeout=15,
    )
    if r.status_code in (404, 406):
        return None
    r.raise_for_status()
    return r.json()


def get_interview_report_for_session(session_id: str) -> dict | None:
    url, key = _cfg()
    endpoint = (
        f"{url}/rest/v1/interview_reports"
        f"?select=*&session_id=eq.{session_id}"
        f"&order=report_generated_at.desc"
        f"&limit=1"
    )
    r = requests.get(endpoint, headers=_headers(key), timeout=15)
    r.raise_for_status()
    data = r.json()
    return data[0] if isinstance(data, list) and data else None


def get_interview_questions_for_session(session_id: str) -> list[dict]:
    """
    New interview_questions schema stores 1 row per session with a JSON array `questions`.
    """
    url, key = _cfg()
    endpoint = f"{url}/rest/v1/interview_questions?select=questions&session_id=eq.{session_id}"
    r = requests.get(
        endpoint,
        headers=_headers(key, accept="application/vnd.pgrst.object+json"),
        timeout=15,
    )
    if r.status_code in (404, 406):
        return []
    r.raise_for_status()
    data = r.json() or {}
    q = data.get("questions")
    return q if isinstance(q, list) else []


def get_session(firebase_uid: str, session_id: str) -> dict | None:
    url, key = _cfg()
    endpoint = (
        f"{url}/rest/v1/interview_sessions"
        f"?select=id,firebase_uid&id=eq.{session_id}"
    )
    r = requests.get(
        endpoint,
        headers=_headers(key, accept="application/vnd.pgrst.object+json"),
        timeout=15,
    )
    if r.status_code == 406 or r.status_code == 404:
        return None
    r.raise_for_status()
    data = r.json()
    if not data or data.get("firebase_uid") != firebase_uid:
        return None
    return data


def insert_interview_question(payload: dict) -> None:
    """
    interview_questions table (new schema):
      session_id uuid primary key references interview_sessions(id),
      firebase_uid text not null,
      questions jsonb default '[]'

    We store one row per session and append each Q/A turn into `questions` (json array).
    """
    url, key = _cfg()
    session_id = payload.get("session_id")
    firebase_uid = payload.get("firebase_uid")
    if not session_id or not firebase_uid:
        raise RuntimeError("insert_interview_question requires session_id and firebase_uid")

    # Fetch existing questions array (406 => none yet).
    get_endpoint = f"{url}/rest/v1/interview_questions?select=session_id,questions&session_id=eq.{session_id}"
    r0 = requests.get(
        get_endpoint,
        headers=_headers(key, accept="application/vnd.pgrst.object+json"),
        timeout=15,
    )
    existing: list = []
    if r0.status_code not in (404, 406):
        r0.raise_for_status()
        data0 = r0.json() or {}
        q = data0.get("questions")
        if isinstance(q, list):
            existing = q

    item = {
        "question": payload.get("question"),
        "user_answer": payload.get("user_answer"),
        "ai_feedback": payload.get("ai_feedback"),
        "score": payload.get("score"),
        "created_at": payload.get("created_at"),
    }
    # Keep payload compact and stable (avoid null noise).
    item = {k: v for k, v in item.items() if v is not None}

    upsert_endpoint = f"{url}/rest/v1/interview_questions?on_conflict=session_id"
    r = requests.post(
        upsert_endpoint,
        headers=_headers(key, prefer="resolution=merge-duplicates,return=minimal"),
        json={
            "session_id": session_id,
            "firebase_uid": firebase_uid,
            "questions": [*existing, item],
        },
        timeout=15,
    )
    r.raise_for_status()


def insert_interview_report(payload: dict) -> None:
    url, key = _cfg()
    endpoint = f"{url}/rest/v1/interview_reports"
    r = requests.post(
        endpoint,
        headers=_headers(key, prefer="return=minimal"),
        json=payload,
        timeout=15,
    )
    r.raise_for_status()


def insert_skill_analysis(firebase_uid: str, skill: str, proficiency_score: int) -> None:
    url, key = _cfg()
    endpoint = f"{url}/rest/v1/skill_analysis"
    payload = {
        "firebase_uid": firebase_uid,
        "skill": skill,
        "proficiency_score": proficiency_score,
    }
    r = requests.post(
        endpoint,
        headers=_headers(key, prefer="return=minimal"),
        json=payload,
        timeout=15,
    )
    r.raise_for_status()


def get_skill_analysis_for_user(firebase_uid: str) -> list[dict]:
    url, key = _cfg()
    endpoint = f"{url}/rest/v1/skill_analysis?firebase_uid=eq.{firebase_uid}&order=last_updated.desc"
    r = requests.get(
        endpoint,
        headers=_headers(key, accept="application/json"),
        timeout=15,
    )
    r.raise_for_status()
    return r.json()


def insert_resume(firebase_uid: str, resume_name: str, parsed: bool = False) -> dict:
    url, key = _cfg()
    endpoint = f"{url}/rest/v1/resumes"
    payload = {
        "firebase_uid": firebase_uid,
        "resume_name": resume_name,
        "parsed": parsed,
    }
    r = requests.post(
        endpoint,
        headers=_headers(key, prefer="return=representation"),
        json=payload,
        timeout=15,
    )
    r.raise_for_status()
    data = r.json()
    return data[0] if isinstance(data, list) and data else {}


def set_resume_parsed(resume_id: str, parsed: bool = True) -> None:
    url, key = _cfg()
    endpoint = f"{url}/rest/v1/resumes?id=eq.{resume_id}"
    r = requests.patch(
        endpoint,
        headers=_headers(key, prefer="return=minimal"),
        json={"parsed": parsed},
        timeout=15,
    )
    r.raise_for_status()


def insert_resume_parsed_data(payload: dict) -> None:
    url, key = _cfg()
    endpoint = f"{url}/rest/v1/resume_parsed_data"
    r = requests.post(
        endpoint,
        headers=_headers(key, prefer="return=minimal"),
        json=payload,
        timeout=15,
    )
    r.raise_for_status()


def upsert_job_fit_result(firebase_uid: str, payload: dict) -> None:
    url, key = _cfg()
    endpoint = f"{url}/rest/v1/job_fit_results?on_conflict=firebase_uid"
    data = {"firebase_uid": firebase_uid, **payload}
    r = requests.post(
        endpoint,
        headers=_headers(key, prefer="resolution=merge-duplicates,return=minimal"),
        json=data,
        timeout=15,
    )
    r.raise_for_status()


def upsert_aptitude_result(firebase_uid: str, payload: dict) -> None:
    url, key = _cfg()
    endpoint = f"{url}/rest/v1/aptitude_results?on_conflict=firebase_uid"
    data = {"firebase_uid": firebase_uid, **payload}
    r = requests.post(
        endpoint,
        headers=_headers(key, prefer="resolution=merge-duplicates,return=minimal"),
        json=data,
        timeout=15,
    )
    r.raise_for_status()


def _get(endpoint: str, accept: str | None = None) -> requests.Response:
    url, key = _cfg()
    r = requests.get(
        f"{url}{endpoint}",
        headers=_headers(key, accept=accept or "application/json"),
        timeout=20,
    )
    r.raise_for_status()
    return r


def _get_object_or_none(endpoint: str) -> dict | None:
    """
    For PostgREST object responses (Accept: application/vnd.pgrst.object+json),
    Supabase returns 406 when no rows match. Treat that as "no data".
    """
    url, key = _cfg()
    r = requests.get(
        f"{url}{endpoint}",
        headers=_headers(key, accept="application/vnd.pgrst.object+json"),
        timeout=20,
    )
    if r.status_code in (404, 406):
        return None
    r.raise_for_status()
    return r.json()


def get_user_row(firebase_uid: str) -> dict | None:
    return _get_object_or_none(f"/rest/v1/users?select=*&firebase_uid=eq.{firebase_uid}")


def list_resumes(firebase_uid: str) -> list[dict]:
    return _get(f"/rest/v1/resumes?select=*&firebase_uid=eq.{firebase_uid}&order=uploaded_at.desc").json()


def list_resume_parsed_data(resume_ids: list[str]) -> list[dict]:
    if not resume_ids:
        return []
    ids = ",".join(resume_ids)
    return _get(f"/rest/v1/resume_parsed_data?select=*&resume_id=in.({ids})&order=parsed_at.desc").json()


def list_interview_sessions(firebase_uid: str, limit: int = 50) -> list[dict]:
    return _get(
        f"/rest/v1/interview_sessions?select=*&firebase_uid=eq.{firebase_uid}&order=started_at.desc&limit={limit}"
    ).json()


def list_interview_reports(session_ids: list[str]) -> list[dict]:
    if not session_ids:
        return []
    ids = ",".join(session_ids)
    return _get(f"/rest/v1/interview_reports?select=*&session_id=in.({ids})&order=report_generated_at.desc").json()


def list_interview_questions(session_ids: list[str], limit: int = 300) -> list[dict]:
    if not session_ids:
        return []
    ids = ",".join(session_ids)
    return _get(
        f"/rest/v1/interview_questions?select=*&session_id=in.({ids})&order=created_at.asc&limit={limit}"
    ).json()


def get_job_fit_result(firebase_uid: str) -> dict | None:
    return _get_object_or_none(f"/rest/v1/job_fit_results?select=*&firebase_uid=eq.{firebase_uid}")


def get_aptitude_result(firebase_uid: str) -> dict | None:
    return _get_object_or_none(f"/rest/v1/aptitude_results?select=*&firebase_uid=eq.{firebase_uid}")

