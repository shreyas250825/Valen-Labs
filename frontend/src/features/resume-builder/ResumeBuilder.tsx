import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, FileText, Save, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../services/api";
import {
  fetchResumeBuilderDraftFromBackend,
  saveResumeBuilderDraftToBackend,
} from "../../services/backendSupabase";
import InputBox from "./InputBox";
import ExperienceBlock from "./ExperienceBlock";
import ProjectBlock from "./ProjectBlock";
import VolunteerBlock from "./VolunteerBlock";
import PreviewPanel from "./PreviewPanel";
import {
  emptyExperience,
  emptyProject,
  emptyVolunteer,
  initialResumeState,
  LIMITS,
  toApiPayload,
  toSupabaseDraftPayload,
  mergeServerDraft,
  hasMeaningfulResumeDraft,
  type ExperienceItem,
  type ProjectItem,
  type ResumeBuilderState,
  type VolunteerItem,
} from "./types";
import { clampField } from "./utils/resumeLatexGenerator";

function formatApiError(data: unknown): string {
  if (!data || typeof data !== "object") return "Request failed";
  const d = data as { detail?: unknown };
  if (typeof d.detail === "string") return d.detail;
  if (Array.isArray(d.detail) && d.detail[0] && typeof (d.detail[0] as { msg?: string }).msg === "string") {
    return (d.detail[0] as { msg: string }).msg;
  }
  return "Request failed";
}

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const [state, setState] = useState<ResumeBuilderState>(() => initialResumeState());
  const stateRef = useRef(state);
  stateRef.current = state;
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [latexFallback, setLatexFallback] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const pdfUrlRef = useRef<string | null>(null);
  const [cloudHydrated, setCloudHydrated] = useState(false);
  const [cloudSaveStatus, setCloudSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastCloudSaved, setLastCloudSaved] = useState<string | null>(null);

  const payloadJson = useMemo(() => JSON.stringify(toApiPayload(state)), [state]);
  const draftJson = useMemo(() => JSON.stringify(toSupabaseDraftPayload(state)), [state]);

  const refreshPdf = useCallback(async () => {
    setPdfLoading(true);
    setPdfError(null);
    setLatexFallback(null);
    try {
      const body = toApiPayload(stateRef.current);
      const res = await fetch(`${API_BASE_URL}/api/resume/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const ct = res.headers.get("Content-Type") || "";
      if (res.ok && ct.includes("application/pdf")) {
        const blob = await res.blob();
        if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
        const url = URL.createObjectURL(blob);
        pdfUrlRef.current = url;
        setPdfUrl(url);
        return;
      }
      const j = await res.json().catch(() => ({}));
      if (j.latex) setLatexFallback(String(j.latex));
      setPdfUrl(null);
      setPdfError(
        typeof j.error === "string"
          ? j.error
          : formatApiError(j) !== "Request failed"
            ? formatApiError(j)
            : "PDF preview unavailable. You can still download the .tex file below if offered."
      );
    } catch {
      setPdfError("Network error while generating preview.");
      setPdfUrl(null);
    } finally {
      setPdfLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      refreshPdf();
    }, 2000);
    return () => clearTimeout(t);
  }, [payloadJson, refreshPdf]);

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    };
  }, []);

  // Load draft from Supabase (Firebase-authenticated).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { draft } = await fetchResumeBuilderDraftFromBackend();
        if (cancelled) return;
        if (draft && typeof draft === "object") {
          setState(mergeServerDraft(draft));
        }
      } catch {
        // Not signed in or network — keep local empty template
      } finally {
        if (!cancelled) setCloudHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Autosave to Supabase when there is meaningful content (debounced).
  useEffect(() => {
    if (!cloudHydrated) return;
    if (!hasMeaningfulResumeDraft(stateRef.current)) {
      setCloudSaveStatus("idle");
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(async () => {
      if (cancelled) return;
      setCloudSaveStatus("saving");
      try {
        await saveResumeBuilderDraftToBackend(
          toSupabaseDraftPayload(stateRef.current) as unknown as Record<string, unknown>
        );
        if (cancelled) return;
        setCloudSaveStatus("saved");
        setLastCloudSaved(new Date().toISOString());
      } catch (e) {
        if (!cancelled) {
          setCloudSaveStatus("error");
          setActionNotice(e instanceof Error ? e.message : "Could not save resume to cloud");
        }
      }
    }, 2500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [draftJson, cloudHydrated]);

  const handleSaveCloudNow = async () => {
    if (!hasMeaningfulResumeDraft(stateRef.current)) {
      setActionNotice("Add some resume details before saving to the cloud.");
      return;
    }
    setCloudSaveStatus("saving");
    try {
      await saveResumeBuilderDraftToBackend(
        toSupabaseDraftPayload(stateRef.current) as unknown as Record<string, unknown>
      );
      setCloudSaveStatus("saved");
      setLastCloudSaved(new Date().toISOString());
    } catch (e) {
      setCloudSaveStatus("error");
      setActionNotice(e instanceof Error ? e.message : "Could not save resume to cloud");
    }
  };

  const downloadTex = () => {
    if (!latexFallback) return;
    const blob = new Blob([latexFallback], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "resume.tex";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const setBasics = (patch: Partial<ResumeBuilderState["basics"]>) =>
    setState((s) => ({ ...s, basics: { ...s.basics, ...patch } }));
  const setEducation = (patch: Partial<ResumeBuilderState["education"]>) =>
    setState((s) => ({ ...s, education: { ...s.education, ...patch } }));
  const setSkills = (patch: Partial<ResumeBuilderState["skills"]>) =>
    setState((s) => ({ ...s, skills: { ...s.skills, ...patch } }));

  const updateExperience = (i: number, next: ExperienceItem) =>
    setState((s) => ({
      ...s,
      experience: s.experience.map((e, j) => (j === i ? next : e)),
    }));
  const addExperience = () =>
    setState((s) => ({ ...s, experience: [...s.experience, emptyExperience()] }));
  const removeExperience = (i: number) =>
    setState((s) => ({
      ...s,
      experience: s.experience.length > 1 ? s.experience.filter((_, j) => j !== i) : s.experience,
    }));

  const updateProject = (i: number, next: ProjectItem) =>
    setState((s) => ({
      ...s,
      projects: s.projects.map((p, j) => (j === i ? next : p)),
    }));
  const addProject = () =>
    setState((s) => ({ ...s, projects: [...s.projects, emptyProject()] }));
  const removeProject = (i: number) =>
    setState((s) => ({
      ...s,
      projects: s.projects.length > 1 ? s.projects.filter((_, j) => j !== i) : s.projects,
    }));

  const updateVolunteer = (i: number, next: VolunteerItem) =>
    setState((s) => ({
      ...s,
      volunteer: s.volunteer.map((v, j) => (j === i ? next : v)),
    }));
  const addVolunteer = () =>
    setState((s) => ({ ...s, volunteer: [...s.volunteer, emptyVolunteer()] }));
  const removeVolunteer = (i: number) =>
    setState((s) => ({ ...s, volunteer: s.volunteer.filter((_, j) => j !== i) }));

  const setAchievement = (i: number, v: string) =>
    setState((s) => ({
      ...s,
      achievements: s.achievements.map((a, j) => (j === i ? clampField(v, LIMITS.achievement) : a)),
    }));
  const addAchievement = () =>
    setState((s) => ({ ...s, achievements: [...s.achievements, ""] }));
  const removeAchievement = (i: number) =>
    setState((s) => ({
      ...s,
      achievements: s.achievements.length > 1 ? s.achievements.filter((_, j) => j !== i) : s.achievements,
    }));

  const Lb = LIMITS.basics;
  const Le = LIMITS.education;
  const Ls = LIMITS.skills;

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-8 py-24">
        <div className="max-w-[1600px] mx-auto">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>

          {actionNotice && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 flex justify-between gap-4 items-center">
              <span>{actionNotice}</span>
              <button type="button" className="text-amber-300 hover:text-white shrink-0" onClick={() => setActionNotice(null)}>
                Dismiss
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30">
                <FileText className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-purple-400 mb-1">Valen Labs</p>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">Resume Builder</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1 max-w-xl">
                  Fill the sections, preview updates after a short pause, and save your draft to your account.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => void handleSaveCloudNow()}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2.5 text-sm font-semibold hover:bg-white/90 transition"
              >
                {cloudSaveStatus === "saving" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save to cloud
              </button>
              <p className="text-[11px] text-slate-500 text-right max-w-[220px]">
                {cloudSaveStatus === "saved" && lastCloudSaved
                  ? `Saved ${new Date(lastCloudSaved).toLocaleString()}`
                  : cloudSaveStatus === "error"
                    ? "Save failed. Sign in and try again."
                    : cloudHydrated
                      ? "Autosaves ~2.5s after you stop typing."
                      : "Loading cloud draft…"}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_minmax(320px,480px)] gap-8 items-start">
            <div className="space-y-10 pb-24">
              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">Basics</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <InputBox label="Name" value={state.basics.name} onChange={(v) => setBasics({ name: v })} maxLength={Lb.name} />
                  <InputBox label="Email" value={state.basics.email} onChange={(v) => setBasics({ email: v })} maxLength={Lb.email} />
                  <InputBox label="Phone" value={state.basics.phone} onChange={(v) => setBasics({ phone: v })} maxLength={Lb.phone} />
                  <InputBox label="GitHub" value={state.basics.github} onChange={(v) => setBasics({ github: v })} maxLength={Lb.github} />
                  <div className="sm:col-span-2">
                    <InputBox
                      label="Portfolio URL"
                      value={state.basics.portfolio}
                      onChange={(v) => setBasics({ portfolio: v })}
                      maxLength={Lb.portfolio}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">Education</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <InputBox label="College" value={state.education.college} onChange={(v) => setEducation({ college: v })} maxLength={Le.college} />
                  <InputBox label="Location" value={state.education.location} onChange={(v) => setEducation({ location: v })} maxLength={Le.location} />
                  <InputBox label="Degree" value={state.education.degree} onChange={(v) => setEducation({ degree: v })} maxLength={Le.degree} />
                  <InputBox label="GPA" value={state.education.gpa} onChange={(v) => setEducation({ gpa: v })} maxLength={Le.gpa} />
                  <InputBox label="Duration" value={state.education.duration} onChange={(v) => setEducation({ duration: v })} maxLength={Le.duration} />
                  <div className="sm:col-span-2">
                    <InputBox
                      label="Courses"
                      value={state.education.courses}
                      onChange={(v) => setEducation({ courses: v })}
                      maxLength={Le.courses}
                      multiline
                      rows={2}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">Skills</h2>
                <InputBox label="Languages" value={state.skills.languages} onChange={(v) => setSkills({ languages: v })} maxLength={Ls.languages} />
                <InputBox label="Frameworks" value={state.skills.frameworks} onChange={(v) => setSkills({ frameworks: v })} maxLength={Ls.frameworks} />
                <InputBox label="Tools" value={state.skills.tools} onChange={(v) => setSkills({ tools: v })} maxLength={Ls.tools} />
                <InputBox label="Platforms" value={state.skills.platforms} onChange={(v) => setSkills({ platforms: v })} maxLength={Ls.platforms} />
                <InputBox
                  label="Soft skills"
                  value={state.skills.soft_skills}
                  onChange={(v) => setSkills({ soft_skills: v })}
                  maxLength={Ls.soft_skills}
                  multiline
                  rows={2}
                />
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Experience</h2>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add experience
                  </button>
                </div>
                <div className="space-y-4">
                  {state.experience.map((exp, i) => (
                    <ExperienceBlock
                      key={i}
                      index={i}
                      item={exp}
                      onChange={(next) => updateExperience(i, next)}
                      onRemove={() => removeExperience(i)}
                      canRemove={state.experience.length > 1}
                    />
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Projects</h2>
                  <button
                    type="button"
                    onClick={addProject}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add project
                  </button>
                </div>
                <div className="space-y-4">
                  {state.projects.map((proj, i) => (
                    <ProjectBlock
                      key={i}
                      index={i}
                      item={proj}
                      onChange={(next) => updateProject(i, next)}
                      onRemove={() => removeProject(i)}
                      canRemove={state.projects.length > 1}
                    />
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Achievements</h2>
                  <button
                    type="button"
                    onClick={addAchievement}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add line
                  </button>
                </div>
                <div className="space-y-3">
                  {state.achievements.map((ach, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <InputBox
                          label={`Achievement ${i + 1}`}
                          value={ach}
                          onChange={(v) => setAchievement(i, v)}
                          maxLength={LIMITS.achievement}
                          multiline
                          rows={2}
                        />
                      </div>
                      {state.achievements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAchievement(i)}
                          className="mt-6 text-xs text-slate-500 hover:text-red-400"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Volunteer</h2>
                  <button
                    type="button"
                    onClick={addVolunteer}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add volunteer
                  </button>
                </div>
                {state.volunteer.length === 0 ? (
                  <p className="text-sm text-slate-500">Optional — add volunteer roles if you have them.</p>
                ) : (
                  <div className="space-y-4">
                    {state.volunteer.map((vol, i) => (
                      <VolunteerBlock
                        key={i}
                        index={i}
                        item={vol}
                        onChange={(next) => updateVolunteer(i, next)}
                        onRemove={() => removeVolunteer(i)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <PreviewPanel
              pdfUrl={pdfUrl}
              loading={pdfLoading}
              error={pdfError}
              latexFallback={latexFallback}
              onDownloadTex={latexFallback ? downloadTex : undefined}
            />
          </div>
        </div>
    </div>
  );
}
