"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { JobListing } from "@/lib/scrapers/types";

const KeywordsSelect = dynamic(() => import("@/app/components/KeywordsSelect"), { ssr: false });

const PLATFORM_STYLE: Record<string, { border: string; badge: string; label: string }> = {
  linkedin: {
    border: "border-l-blue-500",
    badge: "bg-blue-950 text-blue-300 border-blue-800",
    label: "LinkedIn",
  },
  infojobs: {
    border: "border-l-orange-500",
    badge: "bg-orange-950 text-orange-300 border-orange-800",
    label: "Infojobs",
  },
};

function PlatformBadge({ platform }: { platform: string }) {
  const s = PLATFORM_STYLE[platform] ?? { badge: "bg-slate-800 text-slate-400 border-slate-700", label: platform };
  return (
    <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded border w-20 text-center ${s.badge}`}>
      {s.label}
    </span>
  );
}

export default function JobsPage() {
  const [platform, setPlatform] = useState<"linkedin" | "infojobs">("linkedin");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<Record<string, string>>({});

  async function handleSearch() {
    setError("");
    setJobs([]);
    setSelectedJob(null);
    setLoading(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, keywords, location }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Error al buscar");
      return;
    }
    setJobs(data.jobs ?? []);
  }

  async function handleOptimizeAndApply(job: JobListing) {
    setOptimizing(job.id);

    const optRes = await fetch("/api/cv/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobTitle: job.title,
        company: job.company,
        jobDescription: job.description,
      }),
    });
    const optData = await optRes.json();
    setOptimizing(null);

    if (!optRes.ok) {
      setApplyResult((r) => ({ ...r, [job.id]: `Error optimizando CV: ${optData.error}` }));
      return;
    }

    setApplying(job.id);
    const applyRes = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: job.company,
        position: job.title,
        platform: job.platform,
        jobUrl: job.url,
        jobId: job.id,
        salary: job.salary,
        contactPerson: job.contactPerson,
        optimizedCVId: optData.cv.id,
      }),
    });
    const applyData = await applyRes.json();
    setApplying(null);

    setApplyResult((r) => ({
      ...r,
      [job.id]: applyRes.ok ? "✓ Solicitud registrada" : `Error: ${applyData.error}`,
    }));
  }

  const platformStyle = PLATFORM_STYLE[platform] ?? PLATFORM_STYLE.linkedin;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-6">Buscar Ofertas</h1>

      {/* Search controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 flex flex-wrap gap-3 items-start">
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 self-center">
          {(["linkedin", "infojobs"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors ${
                platform === p
                  ? p === "linkedin" ? "bg-blue-600 text-white" : "bg-orange-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {p === "linkedin" ? "LinkedIn" : "Infojobs"}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-52">
          <KeywordsSelect value={keywords} onChange={setKeywords} placeholder="Palabras clave..." />
        </div>

        <input
          className="flex-1 min-w-36 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 self-center"
          placeholder="Ubicación"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors self-center"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-16 text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          Buscando ofertas en {platformStyle.label}...
        </div>
      )}

      {jobs.length > 0 && (
        <div className="flex gap-4">
          {/* Stacked bars */}
          <div className="flex-1 rounded-xl overflow-hidden border border-slate-800">
            {jobs.map((job, i) => {
              const s = PLATFORM_STYLE[job.platform] ?? PLATFORM_STYLE.linkedin;
              const isSelected = selectedJob?.id === job.id;
              const result = applyResult[job.id];

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(isSelected ? null : job)}
                  className={[
                    "flex items-center gap-3 px-4 py-3 cursor-pointer border-l-4 transition-colors",
                    i < jobs.length - 1 ? "border-b border-slate-800" : "",
                    s.border,
                    isSelected ? "bg-slate-800" : "bg-slate-900 hover:bg-slate-800/60",
                  ].join(" ")}
                >
                  {/* Platform badge — always visible, same width */}
                  <PlatformBadge platform={job.platform} />

                  {/* Title + company/location */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{job.title}</p>
                    <p className="text-slate-400 text-xs truncate">
                      {job.company}
                      {job.location ? ` · ${job.location}` : ""}
                    </p>
                  </div>

                  {/* Salary */}
                  {job.salary && (
                    <span className="shrink-0 text-green-400 text-xs hidden sm:block">{job.salary}</span>
                  )}

                  {/* Easy Apply pill */}
                  {job.isEasyApply && (
                    <span className="shrink-0 text-xs bg-blue-950 text-blue-300 border border-blue-800 rounded-full px-2 py-0.5 hidden md:block">
                      Easy Apply
                    </span>
                  )}

                  {/* Result status */}
                  {result && (
                    <span className={`shrink-0 text-xs ${result.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
                      {result}
                    </span>
                  )}

                  {/* Chevron */}
                  <svg
                    className={`shrink-0 w-4 h-4 text-slate-600 transition-transform ${isSelected ? "rotate-90" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selectedJob && (
            <div className="w-80 shrink-0 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh] sticky top-4">
              {/* Platform source */}
              <div className="flex items-center gap-2">
                <PlatformBadge platform={selectedJob.platform} />
                {selectedJob.postedAt && (
                  <span className="text-xs text-slate-500">Publicado: {selectedJob.postedAt}</span>
                )}
              </div>

              <div>
                <h2 className="font-bold text-white leading-snug">{selectedJob.title}</h2>
                <p className="text-slate-400 text-sm mt-0.5">{selectedJob.company}</p>
                <p className="text-slate-500 text-sm">{selectedJob.location}</p>
                {selectedJob.salary && (
                  <p className="text-green-400 text-sm mt-1">{selectedJob.salary}</p>
                )}
                {selectedJob.contactPerson && (
                  <p className="text-slate-400 text-xs mt-1">Publicado por: {selectedJob.contactPerson}</p>
                )}
              </div>

              {selectedJob.description && (
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">Descripción</p>
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-12">
                    {selectedJob.description}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-auto pt-2">
                <button
                  onClick={() => handleOptimizeAndApply(selectedJob)}
                  disabled={!!applying || !!optimizing}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  {optimizing === selectedJob.id
                    ? "Optimizando CV..."
                    : applying === selectedJob.id
                    ? "Enviando solicitud..."
                    : "Optimizar CV y Aplicar"}
                </button>
                <a
                  href={selectedJob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center border border-slate-700 hover:border-slate-500 text-slate-300 font-medium py-2 rounded-lg text-sm transition-colors"
                >
                  Ver oferta en {PLATFORM_STYLE[selectedJob.platform]?.label ?? selectedJob.platform} →
                </a>
              </div>

              {applyResult[selectedJob.id] && (
                <p className={`text-sm text-center font-medium ${applyResult[selectedJob.id].startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
                  {applyResult[selectedJob.id]}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && jobs.length === 0 && !error && (
        <div className="text-center py-16 text-slate-500">
          Busca ofertas usando los filtros de arriba.
        </div>
      )}
    </div>
  );
}
