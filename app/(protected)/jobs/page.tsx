"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { JobListing } from "@/lib/scrapers/types";

const KeywordsSelect = dynamic(() => import("@/app/components/KeywordsSelect"), { ssr: false });

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
    setApplyResult({});

    // 1. Optimize CV
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
      setApplyResult({ [job.id]: `Error optimizando CV: ${optData.error}` });
      return;
    }

    const cvId = optData.cv.id;

    // 2. Apply
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
        optimizedCVId: cvId,
      }),
    });
    const applyData = await applyRes.json();
    setApplying(null);

    if (!applyRes.ok) {
      setApplyResult({ [job.id]: `Error: ${applyData.error}` });
    } else {
      setApplyResult({ [job.id]: "✓ Solicitud registrada" });
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-6">Buscar Ofertas</h1>

      {/* Search bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 flex flex-wrap gap-3">
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(["linkedin", "infojobs"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                platform === p ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-48">
          <KeywordsSelect
            value={keywords}
            onChange={setKeywords}
            placeholder="Palabras clave..."
          />
        </div>
        <input
          className="flex-1 min-w-32 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          placeholder="Ubicación"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
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
          Buscando ofertas... esto puede tardar unos segundos.
        </div>
      )}

      {/* Job list + detail panel */}
      {jobs.length > 0 && (
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[70vh]">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-colors ${
                  selectedJob?.id === job.id
                    ? "border-blue-500"
                    : "border-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{job.title}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{job.company}</p>
                    <p className="text-slate-500 text-xs">{job.location}</p>
                    {job.salary && <p className="text-green-400 text-xs mt-1">{job.salary}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {job.isEasyApply && (
                      <span className="text-xs bg-blue-900 text-blue-300 border border-blue-700 rounded-full px-2 py-0.5">
                        Easy Apply
                      </span>
                    )}
                    <span className="text-xs text-slate-600 capitalize">{job.platform}</span>
                  </div>
                </div>
                {applyResult[job.id] && (
                  <p className="text-xs mt-2 text-green-400">{applyResult[job.id]}</p>
                )}
              </div>
            ))}
          </div>

          {selectedJob && (
            <div className="w-80 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
              <div>
                <h2 className="font-bold text-white">{selectedJob.title}</h2>
                <p className="text-slate-400 text-sm">{selectedJob.company}</p>
                <p className="text-slate-500 text-sm">{selectedJob.location}</p>
                {selectedJob.salary && <p className="text-green-400 text-sm mt-1">{selectedJob.salary}</p>}
                {selectedJob.contactPerson && (
                  <p className="text-slate-400 text-xs mt-1">Publicado por: {selectedJob.contactPerson}</p>
                )}
              </div>
              {selectedJob.description && (
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Descripción</p>
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-10">
                    {selectedJob.description}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-2 mt-auto">
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
                  Ver oferta →
                </a>
              </div>
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
