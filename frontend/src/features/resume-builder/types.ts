export const LIMITS = {
  basics: { name: 40, email: 50, phone: 20, github: 60, portfolio: 60 },
  education: { college: 60, location: 40, degree: 80, gpa: 10, duration: 30, courses: 200 },
  skills: { languages: 120, frameworks: 150, tools: 120, platforms: 150, soft_skills: 120 },
  experience: { company: 80, location: 40, role: 80, duration: 30, bullet: 200 },
  project: { titleTech: 120, description: 200 },
  achievement: 120,
  volunteer: { roleOrg: 100, location: 40, description: 150, duration: 30 },
} as const;

export interface Basics {
  name: string;
  email: string;
  phone: string;
  github: string;
  portfolio: string;
}

export interface Education {
  college: string;
  location: string;
  degree: string;
  gpa: string;
  duration: string;
  courses: string;
}

export interface Skills {
  languages: string;
  frameworks: string;
  tools: string;
  platforms: string;
  soft_skills: string;
}

export interface ExperienceItem {
  company: string;
  location: string;
  role: string;
  duration: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
}

export interface ProjectItem {
  titleTech: string;
  description: string;
}

export interface VolunteerItem {
  roleOrg: string;
  location: string;
  description: string;
  duration: string;
}

export interface ResumeBuilderState {
  basics: Basics;
  education: Education;
  skills: Skills;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  achievements: string[];
  volunteer: VolunteerItem[];
}

export function emptyExperience(): ExperienceItem {
  return {
    company: "",
    location: "",
    role: "",
    duration: "",
    bullet1: "",
    bullet2: "",
    bullet3: "",
  };
}

export function emptyProject(): ProjectItem {
  return { titleTech: "", description: "" };
}

export function emptyVolunteer(): VolunteerItem {
  return { roleOrg: "", location: "", description: "", duration: "" };
}

export function initialResumeState(): ResumeBuilderState {
  return {
    basics: { name: "", email: "", phone: "", github: "", portfolio: "" },
    education: { college: "", location: "", degree: "", gpa: "", duration: "", courses: "" },
    skills: { languages: "", frameworks: "", tools: "", platforms: "", soft_skills: "" },
    experience: [emptyExperience()],
    projects: [emptyProject()],
    achievements: [""],
    volunteer: [],
  };
}

/** Payload shape expected by FastAPI (snake_case + camelCase aliases where needed). */
export function toApiPayload(s: ResumeBuilderState): Record<string, unknown> {
  return {
    basics: s.basics,
    education: s.education,
    skills: s.skills,
    experience: s.experience,
    projects: s.projects.map((p) => ({
      titleTech: p.titleTech,
      description: p.description,
    })),
    achievements: s.achievements.filter((a) => a.trim()),
    volunteer: s.volunteer.map((v) => ({
      roleOrg: v.roleOrg,
      location: v.location,
      description: v.description,
      duration: v.duration,
    })),
  };
}

/** Full form state for Supabase round-trip (includes empty achievement rows). */
export function toSupabaseDraftPayload(s: ResumeBuilderState): Record<string, unknown> {
  return {
    basics: s.basics,
    education: s.education,
    skills: s.skills,
    experience: s.experience,
    projects: s.projects,
    achievements: s.achievements,
    volunteer: s.volunteer,
  };
}

function pickStr(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.slice(0, max);
}

/** Merge server JSON into a safe ResumeBuilderState (unknown / partial payloads). */
export function hasMeaningfulResumeDraft(s: ResumeBuilderState): boolean {
  if (s.basics.name.trim() || s.basics.email.trim() || s.basics.phone.trim()) return true;
  if (s.basics.github.trim() || s.basics.portfolio.trim()) return true;
  if (
    s.education.college.trim() ||
    s.education.degree.trim() ||
    s.education.courses.trim()
  )
    return true;
  if (
    s.skills.languages.trim() ||
    s.skills.frameworks.trim() ||
    s.skills.tools.trim() ||
    s.skills.platforms.trim() ||
    s.skills.soft_skills.trim()
  )
    return true;
  for (const ex of s.experience) {
    if (
      ex.company.trim() ||
      ex.role.trim() ||
      ex.bullet1.trim() ||
      ex.bullet2.trim() ||
      ex.bullet3.trim()
    )
      return true;
  }
  for (const p of s.projects) {
    if (p.titleTech.trim() || p.description.trim()) return true;
  }
  for (const a of s.achievements) {
    if (a.trim()) return true;
  }
  for (const v of s.volunteer) {
    if (v.roleOrg.trim() || v.description.trim()) return true;
  }
  return false;
}

export function mergeServerDraft(raw: unknown): ResumeBuilderState {
  const base = initialResumeState();
  if (!raw || typeof raw !== "object") return base;
  const d = raw as Record<string, unknown>;

  const basics = d.basics && typeof d.basics === "object" ? (d.basics as Record<string, unknown>) : {};
  const education =
    d.education && typeof d.education === "object" ? (d.education as Record<string, unknown>) : {};
  const skills = d.skills && typeof d.skills === "object" ? (d.skills as Record<string, unknown>) : {};

  const expIn = Array.isArray(d.experience) ? d.experience : [];
  const experience: ExperienceItem[] =
    expIn.length > 0
      ? expIn.map((row) => {
          const r = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
          return {
            company: pickStr(r.company, LIMITS.experience.company),
            location: pickStr(r.location, LIMITS.experience.location),
            role: pickStr(r.role, LIMITS.experience.role),
            duration: pickStr(r.duration, LIMITS.experience.duration),
            bullet1: pickStr(r.bullet1, LIMITS.experience.bullet),
            bullet2: pickStr(r.bullet2, LIMITS.experience.bullet),
            bullet3: pickStr(r.bullet3, LIMITS.experience.bullet),
          };
        })
      : base.experience;

  const projIn = Array.isArray(d.projects) ? d.projects : [];
  const projects: ProjectItem[] =
    projIn.length > 0
      ? projIn.map((row) => {
          const r = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
          const title =
            typeof r.titleTech === "string"
              ? r.titleTech
              : typeof r.title_tech === "string"
                ? r.title_tech
                : "";
          return {
            titleTech: pickStr(title, LIMITS.project.titleTech),
            description: pickStr(r.description, LIMITS.project.description),
          };
        })
      : base.projects;

  const achIn = Array.isArray(d.achievements) ? d.achievements : [];
  const achievements: string[] =
    achIn.length > 0
      ? achIn.map((a) => pickStr(typeof a === "string" ? a : String(a ?? ""), LIMITS.achievement))
      : base.achievements;

  const volIn = Array.isArray(d.volunteer) ? d.volunteer : [];
  const volunteer: VolunteerItem[] = volIn.map((row) => {
    const r = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
    const ro =
      typeof r.roleOrg === "string"
        ? r.roleOrg
        : typeof r.role_org === "string"
          ? r.role_org
          : "";
    return {
      roleOrg: pickStr(ro, LIMITS.volunteer.roleOrg),
      location: pickStr(r.location, LIMITS.volunteer.location),
      description: pickStr(r.description, LIMITS.volunteer.description),
      duration: pickStr(r.duration, LIMITS.volunteer.duration),
    };
  });

  return {
    basics: {
      name: pickStr(basics.name, LIMITS.basics.name) || base.basics.name,
      email: pickStr(basics.email, LIMITS.basics.email),
      phone: pickStr(basics.phone, LIMITS.basics.phone),
      github: pickStr(basics.github, LIMITS.basics.github),
      portfolio: pickStr(basics.portfolio, LIMITS.basics.portfolio),
    },
    education: {
      college: pickStr(education.college, LIMITS.education.college),
      location: pickStr(education.location, LIMITS.education.location),
      degree: pickStr(education.degree, LIMITS.education.degree),
      gpa: pickStr(education.gpa, LIMITS.education.gpa),
      duration: pickStr(education.duration, LIMITS.education.duration),
      courses: pickStr(education.courses, LIMITS.education.courses),
    },
    skills: {
      languages: pickStr(skills.languages, LIMITS.skills.languages),
      frameworks: pickStr(skills.frameworks, LIMITS.skills.frameworks),
      tools: pickStr(skills.tools, LIMITS.skills.tools),
      platforms: pickStr(skills.platforms, LIMITS.skills.platforms),
      soft_skills: pickStr(
        typeof skills.soft_skills === "string"
          ? skills.soft_skills
          : typeof (skills as { softSkills?: string }).softSkills === "string"
            ? (skills as { softSkills?: string }).softSkills!
            : "",
        LIMITS.skills.soft_skills
      ),
    },
    experience,
    projects,
    achievements,
    volunteer,
  };
}
