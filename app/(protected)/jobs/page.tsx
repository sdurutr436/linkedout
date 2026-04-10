"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { JobListing } from "@/lib/scrapers/types";

const KeywordsSelect = dynamic(() => import("@/app/components/KeywordsSelect"), { ssr: false });

const PLATFORM_STYLE: Record<string, { border: string; badge: string; label: string; badgeBg: string }> = {
  linkedin: {
    border: "border-l-[#0077B5]",
    badge: "border-outline-variant/30 text-on-surface",
    badgeBg: "bg-surface-container-highest",
    label: "LINKEDIN_V2",
  },
  infojobs: {
    border: "border-l-[#ff6000]",
    badge: "border-outline-variant/30 text-on-surface",
    badgeBg: "bg-surface-container-highest",
    label: "INFOJOBS_API",
  },
};

function PlatformBadge({ platform }: { platform: string }) {
  const s = PLATFORM_STYLE[platform] ?? {
    badge: "border-outline-variant/30 text-secondary",
    badgeBg: "bg-surface-container-highest",
    label: platform.toUpperCase(),
  };
  return (
    <span
      className={`shrink-0 font-label text-[9px] border px-2 py-0.5 uppercase ${s.badge} ${s.badgeBg}`}
    >
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
      body: JSON.stringify({ jobTitle: job.title, company: job.company, jobDescription: job.description }),
    });
    const optData = await optRes.json();
    setOptimizing(null);
    if (!optRes.ok) {
      setApplyResult((r) => ({ ...r, [job.id]: `Error: ${optData.error}` }));
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant/20 px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="text-primary-container" aria-hidden="true">/</span>
            JOB_DISCOVERY_ENGINE
          </h1>
          <div className="font-label text-[10px] text-secondary opacity-60 flex items-center gap-3 mt-1">
            <span>PLATFORM: {platform.toUpperCase()}</span>
            {jobs.length > 0 && (
              <>
                <span className="w-1 h-1 bg-outline-variant rounded-full" aria-hidden="true" />
                <span className="flex items-center gap-1 text-primary-container">
                  <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse" aria-hidden="true" />
                  RESULTS: {jobs.length}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Search controls */}
      <section
        aria-label="Controles de búsqueda"
        className="border-b border-outline-variant/20 px-6 py-4 bg-surface-container-low"
      >
        <div className="flex flex-wrap gap-3 items-start">
          {/* Platform toggle */}
          <fieldset>
            <legend className="sr-only">Plataforma de búsqueda</legend>
            <div
              className="flex border border-outline-variant/30"
              role="group"
              aria-label="Seleccionar plataforma"
            >
              {(["linkedin", "infojobs"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  aria-pressed={platform === p}
                  className={[
                    "px-4 py-2 font-headline text-xs font-bold uppercase tracking-wider transition-colors",
                    platform === p
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface-container text-secondary hover:bg-surface-container-high",
                  ].join(" ")}
                >
                  {p === "linkedin" ? "LINKEDIN" : "INFOJOBS"}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Keywords */}
          <div className="flex-1 min-w-52" aria-label="Palabras clave">
            <KeywordsSelect value={keywords} onChange={setKeywords} placeholder="KEYWORDS..." />
          </div>

          {/* Location */}
          <div className="flex-1 min-w-36">
            <label htmlFor="job-location" className="sr-only">Ubicación</label>
            <input
              id="job-location"
              className="w-full bg-surface-container border border-outline-variant/40 font-label text-xs text-secondary px-4 py-2 focus:outline-none focus:border-primary-container transition-colors uppercase placeholder:normal-case placeholder:text-secondary/40"
              placeholder="Ubicación"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-primary-container text-on-primary-container font-headline text-xs font-bold px-5 py-2 uppercase tracking-wider hover:bg-primary-fixed disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              {loading ? "hourglass_empty" : "search"}
            </span>
            {loading ? "SCANNING..." : "EXECUTE_SEARCH"}
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mx-6 mt-4 bg-error-container/20 border border-error-container/50 text-error font-label text-xs px-4 py-3 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">error</span>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div
          className="flex-1 flex flex-col items-center justify-center py-16"
          role="status"
          aria-live="polite"
        >
          <div className="font-label text-sm text-secondary/60 terminal-cursor uppercase tracking-widest">
            SCRAPING_{platform.toUpperCase()}
          </div>
          <div className="font-label text-[10px] text-secondary/30 mt-2 uppercase">
            Buffer active — awaiting results
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && jobs.length > 0 && (
        <div className="flex flex-1 overflow-hidden">
          {/* Job list */}
          <div className="flex-1 overflow-y-auto">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-2 bg-surface border-b border-outline-variant/20 font-label text-[10px] text-outline font-bold uppercase tracking-[0.1em] sticky top-0 z-10">
              <div className="col-span-1">#ID</div>
              <div className="col-span-5">ENTRY_DESCRIPTOR</div>
              <div className="col-span-3">PLATFORM_SOURCE</div>
              <div className="col-span-3 text-right">EXECUTION</div>
            </div>

            <ol aria-label="Resultados de búsqueda">
              {jobs.map((job, i) => {
                const ps = PLATFORM_STYLE[job.platform] ?? PLATFORM_STYLE.linkedin;
                const isSelected = selectedJob?.id === job.id;
                const result = applyResult[job.id];

                return (
                  <li key={job.id}>
                    <article
                      aria-label={`${job.title} en ${job.company}`}
                      className={[
                        "grid grid-cols-12 gap-4 px-6 py-3 border-b border-outline-variant/10 border-l-4 transition-colors cursor-pointer group",
                        ps.border,
                        isSelected
                          ? "bg-surface-container-high"
                          : "bg-surface-container-low hover:bg-surface-container",
                      ].join(" ")}
                      onClick={() => setSelectedJob(isSelected ? null : job)}
                    >
                      <div className="col-span-1 font-label text-[10px] text-secondary/50 pt-1 self-start">
                        #{String(i + 1).padStart(4, "0")}
                      </div>

                      <div className="col-span-5">
                        <div
                          className={[
                            "font-headline text-sm font-bold uppercase leading-tight transition-colors",
                            isSelected ? "text-primary-container" : "text-on-surface group-hover:text-primary-container",
                          ].join(" ")}
                        >
                          {job.title}
                        </div>
                        <div className="font-body text-[11px] text-secondary mt-0.5">
                          {job.company}
                          {job.location ? ` // ${job.location}` : ""}
                        </div>
                        {job.salary && (
                          <div className="font-label text-[10px] text-primary font-bold mt-1">
                            {job.salary}
                          </div>
                        )}
                      </div>

                      <div className="col-span-3 flex flex-col justify-center gap-1">
                        <PlatformBadge platform={job.platform} />
                        {job.isEasyApply && (
                          <span className="font-label text-[9px] border border-primary-container/30 text-primary-container px-2 py-0.5 uppercase w-fit">
                            EASY_APPLY
                          </span>
                        )}
                        {result && (
                          <span
                            className={`font-label text-[9px] font-bold ${
                              result.startsWith("✓") ? "text-primary-container" : "text-error"
                            }`}
                          >
                            {result}
                          </span>
                        )}
                      </div>

                      <div className="col-span-3 flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJob(isSelected ? null : job);
                          }}
                          aria-label={`${isSelected ? "Cerrar" : "Ver"} detalles de ${job.title}`}
                          aria-expanded={isSelected}
                          className="bg-surface-container-lowest border border-outline-variant/50 hover:border-primary-container font-headline text-[9px] uppercase px-3 py-1 text-secondary hover:text-primary-container transition-all"
                        >
                          {isSelected ? "CLOSE" : "PREVIEW"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOptimizeAndApply(job);
                          }}
                          disabled={!!applying || !!optimizing}
                          aria-label={`Optimizar CV y aplicar a ${job.title} en ${job.company}`}
                          className="bg-primary-container text-on-primary font-headline text-[9px] font-bold uppercase px-3 py-1 hover:bg-primary-fixed disabled:opacity-50 transition-colors"
                        >
                          {optimizing === job.id
                            ? "OPT..."
                            : applying === job.id
                            ? "APPLY..."
                            : "APPLY_FAST"}
                        </button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Detail panel */}
          {selectedJob && (
            <aside
              aria-label={`Detalles de ${selectedJob.title}`}
              className="w-80 shrink-0 border-l border-outline-variant/20 bg-surface-container-lowest flex flex-col overflow-y-auto sticky top-0 h-full max-h-[calc(100vh-160px)]"
            >
              <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Platform + close */}
                <div className="flex items-center justify-between">
                  <PlatformBadge platform={selectedJob.platform} />
                  <button
                    onClick={() => setSelectedJob(null)}
                    aria-label="Cerrar panel de detalles"
                    className="text-secondary/40 hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">close</span>
                  </button>
                </div>

                {/* Job info */}
                <div>
                  <h2 className="font-headline font-bold text-on-surface uppercase leading-tight">
                    {selectedJob.title}
                  </h2>
                  <p className="text-secondary text-sm mt-1">{selectedJob.company}</p>
                  <p className="text-secondary/60 text-sm">{selectedJob.location}</p>
                  {selectedJob.salary && (
                    <p className="text-primary font-bold text-sm mt-1">{selectedJob.salary}</p>
                  )}
                  {selectedJob.postedAt && (
                    <p className="font-label text-[9px] text-secondary/40 mt-1 uppercase">
                      POSTED: {selectedJob.postedAt}
                    </p>
                  )}
                  {selectedJob.contactPerson && (
                    <p className="font-label text-[9px] text-secondary/50 mt-1">
                      RECRUITER: {selectedJob.contactPerson}
                    </p>
                  )}
                </div>

                {/* Description */}
                {selectedJob.description && (
                  <div>
                    <div className="font-headline text-[10px] font-bold text-primary-container border-b border-outline-variant/20 pb-1 mb-2 uppercase tracking-widest">
                      Job_Description
                    </div>
                    <p className="text-secondary text-xs leading-relaxed line-clamp-12 font-label">
                      {selectedJob.description}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-auto pt-2">
                  <button
                    onClick={() => handleOptimizeAndApply(selectedJob)}
                    disabled={!!applying || !!optimizing}
                    aria-label={`Optimizar CV y aplicar a ${selectedJob.title}`}
                    className="w-full bg-primary-container text-on-primary font-headline text-xs font-bold py-3 uppercase tracking-wider hover:bg-primary-fixed disabled:opacity-50 transition-colors"
                  >
                    {optimizing === selectedJob.id
                      ? "OPTIMIZING_CV..."
                      : applying === selectedJob.id
                      ? "SUBMITTING..."
                      : "OPTIMIZE_AND_APPLY"}
                  </button>
                  <a
                    href={selectedJob.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center border border-outline-variant/40 hover:border-primary-container/50 text-secondary font-headline text-xs font-bold py-3 uppercase tracking-wider transition-colors"
                    aria-label={`Ver oferta en ${PLATFORM_STYLE[selectedJob.platform]?.label ?? selectedJob.platform} (abre nueva pestaña)`}
                  >
                    VIEW_SOURCE →
                  </a>
                </div>

                {applyResult[selectedJob.id] && (
                  <p
                    role="status"
                    className={`text-xs text-center font-bold font-label ${
                      applyResult[selectedJob.id].startsWith("✓")
                        ? "text-primary-container"
                        : "text-error"
                    }`}
                  >
                    {applyResult[selectedJob.id]}
                  </p>
                )}
              </div>
            </aside>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && jobs.length === 0 && !error && (
        <div
          className="flex-1 flex flex-col items-center justify-center py-16"
          role="status"
        >
          <p className="font-headline text-sm text-secondary/30 uppercase tracking-widest">
            BUFFER_EMPTY
          </p>
          <p className="font-label text-xs text-secondary/20 mt-2 uppercase">
            Execute a search to populate the discovery feed
          </p>
        </div>
      )}

      {/* Status footer */}
      <footer className="h-10 bg-surface-container-lowest border-t border-outline-variant/20 px-6 flex items-center justify-between font-label text-[9px] mt-auto">
        <div className="flex items-center gap-6">
          <span className="text-secondary/40 uppercase">
            PLATFORM: <span className="text-secondary/70">{platform.toUpperCase()}</span>
          </span>
          <span className="text-secondary/40 uppercase">
            RESULTS: <span className="text-secondary/70">{jobs.length}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary-container rounded-full" aria-hidden="true" />
          <span className="text-primary-container uppercase">READY</span>
        </div>
      </footer>
    </div>
  );
}
