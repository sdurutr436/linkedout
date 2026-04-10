import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ─── Profile ──────────────────────────────────────────────────────────────────

export const preferencesSchema = z.object({
  keywords: z.string().default(""),
  location: z.string().default(""),
  jobType: z.enum(["fulltime", "parttime", "contract", "internship"]).default("fulltime"),
  salaryMin: z.string().default(""),
});

export const updateProfileSchema = z.object({
  cvContent: z.string().optional(),
  cvFileName: z.string().optional(),
  titulaciones: z.string().optional(),
  experiencia: z.string().optional(),
  linkedinEmail: z.string().email().optional().or(z.literal("")),
  linkedinPassword: z.string().optional(),
  infojobsEmail: z.string().email().optional().or(z.literal("")),
  infojobsPassword: z.string().optional(),
  preferences: preferencesSchema.optional(),
});

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const searchJobsSchema = z.object({
  platform: z.enum(["linkedin", "infojobs"]),
  keywords: z.string().min(1, "Keywords are required"),
  location: z.string().optional(),
  jobType: z.enum(["fulltime", "parttime", "contract", "internship"]).optional(),
  maxResults: z.number().int().min(1).max(50).default(20),
});

// ─── CV ───────────────────────────────────────────────────────────────────────

export const optimizeCVSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  jobDescription: z.string().default(""),
});

// ─── Applications ─────────────────────────────────────────────────────────────

export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  platform: z.enum(["linkedin", "infojobs"]),
  jobUrl: z.string().url("Invalid job URL"),
  jobId: z.string().optional(),
  salary: z.string().optional(),
  contactPerson: z.string().optional(),
  companySummary: z.string().optional(),
  optimizedCVId: z.string().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["enviado", "rechazado", "aceptado"]),
});
