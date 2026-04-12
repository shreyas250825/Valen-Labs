"""Pydantic models for structured resume builder (JSON in / out)."""
from typing import List

from pydantic import BaseModel, Field, validator


class BasicsModel(BaseModel):
    name: str = Field("", max_length=40)
    email: str = Field("", max_length=50)
    phone: str = Field("", max_length=20)
    github: str = Field("", max_length=60)
    portfolio: str = Field("", max_length=60)


class EducationModel(BaseModel):
    college: str = Field("", max_length=60)
    location: str = Field("", max_length=40)
    degree: str = Field("", max_length=80)
    gpa: str = Field("", max_length=10)
    duration: str = Field("", max_length=30)
    courses: str = Field("", max_length=200)


class SkillsModel(BaseModel):
    languages: str = Field("", max_length=120)
    frameworks: str = Field("", max_length=150)
    tools: str = Field("", max_length=120)
    platforms: str = Field("", max_length=150)
    soft_skills: str = Field("", max_length=120)


class ExperienceItemModel(BaseModel):
    company: str = Field("", max_length=80)
    location: str = Field("", max_length=40)
    role: str = Field("", max_length=80)
    duration: str = Field("", max_length=30)
    bullet1: str = Field("", max_length=120)
    bullet2: str = Field("", max_length=120)
    bullet3: str = Field("", max_length=120)

    @validator("bullet1", "bullet2", "bullet3", pre=True, always=True)
    def _strip_bullets(cls, v):
        return (v or "")[:120]


class ProjectItemModel(BaseModel):
    title_tech: str = Field("", max_length=120, alias="titleTech")
    description: str = Field("", max_length=180)

    class Config:
        allow_population_by_field_name = True


class VolunteerItemModel(BaseModel):
    role_org: str = Field("", max_length=100, alias="roleOrg")
    location: str = Field("", max_length=40)
    description: str = Field("", max_length=150)
    duration: str = Field("", max_length=30)

    class Config:
        allow_population_by_field_name = True


class ResumeBuilderPayload(BaseModel):
    basics: BasicsModel = Field(default_factory=BasicsModel)
    education: EducationModel = Field(default_factory=EducationModel)
    skills: SkillsModel = Field(default_factory=SkillsModel)
    experience: List[ExperienceItemModel] = Field(default_factory=list)
    projects: List[ProjectItemModel] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    volunteer: List[VolunteerItemModel] = Field(default_factory=list)

    @validator("achievements", pre=True, always=True)
    def _cap_achievements(cls, v):
        if not v:
            return []
        out = []
        for item in v[:25]:
            s = str(item)[:120] if item is not None else ""
            if s.strip():
                out.append(s)
        return out

    @validator("experience", pre=True, always=True)
    def _cap_experience(cls, v):
        if not v:
            return []
        return list(v)[:12]

    @validator("projects", pre=True, always=True)
    def _cap_projects(cls, v):
        if not v:
            return []
        return list(v)[:15]

    @validator("volunteer", pre=True, always=True)
    def _cap_volunteer(cls, v):
        if not v:
            return []
        return list(v)[:12]

    class Config:
        allow_population_by_field_name = True


class EnhanceRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
