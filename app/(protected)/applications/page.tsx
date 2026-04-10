"use client";
import { useEffect, useState } from "react";

interface Application {
  id: string;
  company: string;
  position: string;
  platform: string;
  jobUrl: string;
  salary?: string;
  contactPerson?: string;
  companySummary?: string;
  status: string;
  appliedAt: string;
  optimizedCV?: { id: string; jobTitle: string } | null;
}

const STATUS_OPTIONS = ["enviado", "rechazado", "aceptado"] as const;

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  enviado: {
    bg: "bg-primary-container/20",
    text: "text-primary-container",
    border: "border-primary-container/50",
    label: "ENVIADO",
  },
  rechazado: {
    bg: "bg-error-container/20",
    text: "text-error",
    border: "border-error-container/50",
    label: "RECHAZADO",
  },
  aceptado: {
    bg: "bg-secondary-container/40",
    text: "text-secondary-fixed",
    border: "border-outline-variant/40",
    label: "ACEPTADO",
  },
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then(({ applications }) => {
        setApps(applications ?? []);
        setLoading(false);
      });
  }, []);

  async function handleStatusChange(id: string, status: string) {
    setUpdating(id);
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    }
    setUpdating(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta solicitud?")) return;
    setDeleting(id);
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    setApps((prev) => prev.filter((a) => a.id !== id));
    setDeleting(null);
  }

  const filtered = apps.filter((a) => {
    const statusOk = filterStatus === "all" || a.status === filterStatus;
    const platformOk = filterPlatform === "all" || a.platform === filterPlatform;
    return statusOk && platformOk;
  });

  const stats = {
    total: apps.length,
    enviado: apps.filter((a) => a.status === "enviado").length,
    rechazado: apps.filter((a) => a.status === "rechazado").length,
    aceptado: apps.filter((a) => a.status === "aceptado").length,
  };

  const syncRate = stats.total > 0 ? Math.round(((stats.enviado + stats.aceptado) / stats.total) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page header bar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant/20 px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="text-primary-container" aria-hidden="true">/</span>
            APPLICATION_TRACKER_V4
          </h1>
          <div className="font-label text-[10px] text-secondary opacity-60 flex items-center gap-3 mt-1 flex-wrap">
            <span>ACTIVE_RECORDS: {stats.total}</span>
            <span className="w-1 h-1 bg-outline-variant rounded-full" aria-hidden="true" />
            <span className={stats.total > 0 ? "text-primary-container" : "text-secondary/50"}>
              DATABASE: {stats.total > 0 ? "ESTABLISHED" : "EMPTY"}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filtros de solicitudes">
          <label htmlFor="filter-status" className="sr-only">Filtrar por estado</label>
          <select
            id="filter-status"
            className="bg-surface-container border border-outline-variant/30 font-label text-[10px] text-secondary px-3 py-1.5 uppercase focus:outline-none focus:border-primary-container transition-colors"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">ALL_STATES</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>

          <label htmlFor="filter-platform" className="sr-only">Filtrar por plataforma</label>
          <select
            id="filter-platform"
            className="bg-surface-container border border-outline-variant/30 font-label text-[10px] text-secondary px-3 py-1.5 uppercase focus:outline-none focus:border-primary-container transition-colors"
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
          >
            <option value="all">ALL_PLATFORMS</option>
            <option value="linkedin">LINKEDIN</option>
            <option value="infojobs">INFOJOBS</option>
          </select>
        </div>
      </header>

      {/* Stats bento */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 border-b border-outline-variant/20"
        role="region"
        aria-label="Estadísticas de solicitudes"
      >
        {[
          { label: "TOTAL_RECORDS", value: stats.total, color: "text-on-surface" },
          { label: "ENVIADO", value: stats.enviado, color: "text-primary-container" },
          { label: "RECHAZADO", value: stats.rechazado, color: "text-error" },
          { label: "ACEPTADO", value: stats.aceptado, color: "text-secondary-fixed-dim" },
        ].map((s, i) => (
          <div
            key={s.label}
            className={[
              "p-4 bg-surface-container-low",
              i < 3 ? "border-r border-outline-variant/20" : "",
            ].join(" ")}
          >
            <div className="font-label text-[10px] text-secondary uppercase opacity-60">{s.label}</div>
            <div className={`font-headline text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center" role="status" aria-live="polite">
          <span className="font-label text-sm text-secondary opacity-60 terminal-cursor">
            LOADING_RECORDS
          </span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center" role="status" aria-live="polite">
          <div className="text-center">
            <p className="font-headline text-sm text-secondary/40 uppercase tracking-widest">
              {apps.length === 0 ? "NO_RECORDS_FOUND" : "NO_MATCH_FILTERS"}
            </p>
            {apps.length === 0 && (
              <p className="font-label text-xs text-secondary/30 mt-2">
                Busca y aplica a ofertas en JOB_DISCOVERY
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface border-b border-outline-variant/30">
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-label text-[10px] font-bold text-outline uppercase tracking-widest border-r border-outline-variant/10 w-48"
                >
                  TIMESTAMP
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-label text-[10px] font-bold text-outline uppercase tracking-widest border-r border-outline-variant/10"
                >
                  COMPANY
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-label text-[10px] font-bold text-outline uppercase tracking-widest border-r border-outline-variant/10"
                >
                  POSITION
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-label text-[10px] font-bold text-outline uppercase tracking-widest border-r border-outline-variant/10 w-24"
                >
                  PLATFORM
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-label text-[10px] font-bold text-outline uppercase tracking-widest border-r border-outline-variant/10 w-28"
                >
                  STATUS
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-label text-[10px] font-bold text-outline uppercase tracking-widest border-r border-outline-variant/10 w-16"
                >
                  CV
                </th>
                <th scope="col" className="px-4 py-2 w-10">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="font-label text-xs">
              {filtered.map((app) => {
                const dt = new Date(app.appliedAt);
                const style = STATUS_STYLE[app.status];
                return (
                  <tr
                    key={app.id}
                    className="border-b border-outline-variant/10 hover:bg-surface-container transition-colors"
                  >
                    <td className="px-4 py-2 border-r border-outline-variant/10 text-secondary">
                      <time dateTime={app.appliedAt}>
                        {dt.toLocaleDateString("es-ES")}{" "}
                        <span className="text-secondary/50">
                          {dt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </time>
                    </td>
                    <td className="px-4 py-2 border-r border-outline-variant/10">
                      <div className="text-on-surface font-medium uppercase tracking-tight">
                        {app.company}
                      </div>
                      {app.companySummary && (
                        <div
                          className="text-secondary/40 text-[9px] mt-0.5 max-w-[140px] truncate"
                          title={app.companySummary}
                        >
                          {app.companySummary}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 border-r border-outline-variant/10 text-secondary">
                      {app.position}
                    </td>
                    <td className="px-4 py-2 border-r border-outline-variant/10">
                      <span className="font-label text-[9px] bg-surface-container-highest border border-outline-variant/30 px-2 py-0.5 uppercase text-secondary">
                        {app.platform.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-r border-outline-variant/10">
                      <label htmlFor={`status-${app.id}`} className="sr-only">
                        Estado de solicitud a {app.company}
                      </label>
                      <select
                        id={`status-${app.id}`}
                        value={app.status}
                        disabled={updating === app.id}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={[
                          "text-[9px] font-bold border px-2 py-0.5 uppercase cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-container transition-colors bg-transparent w-full",
                          style?.bg ?? "bg-surface-container",
                          style?.text ?? "text-secondary",
                          style?.border ?? "border-outline-variant/30",
                        ].join(" ")}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-surface-container text-on-surface">
                            {s.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 border-r border-outline-variant/10">
                      {app.optimizedCV ? (
                        <div className="flex gap-2">
                          <a
                            href={`/api/cv/${app.optimizedCV.id}`}
                            className="text-primary-container hover:text-primary font-bold transition-colors"
                            aria-label={`Descargar CV optimizado en formato .md para ${app.company}`}
                          >
                            .md
                          </a>
                          <span className="text-outline-variant/40" aria-hidden="true">|</span>
                          <a
                            href={`/api/cv/${app.optimizedCV.id}?format=pdf`}
                            className="text-primary-container hover:text-primary font-bold transition-colors"
                            aria-label={`Descargar CV optimizado en PDF para ${app.company}`}
                          >
                            PDF
                          </a>
                        </div>
                      ) : (
                        <span className="text-secondary/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleDelete(app.id)}
                        disabled={deleting === app.id}
                        aria-label={`Eliminar solicitud a ${app.company}`}
                        className="text-secondary/30 hover:text-error transition-colors disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">
                          {deleting === app.id ? "hourglass_empty" : "delete"}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* System Health footer */}
      <div
        className="mt-auto grid grid-cols-1 lg:grid-cols-3 border-t border-outline-variant/20 bg-surface"
        aria-label="Métricas del sistema"
      >
        <div className="p-6 border-r border-outline-variant/20">
          <div className="font-headline text-xs font-bold text-primary-container mb-4 uppercase tracking-tighter">
            System Health Metrics
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="font-label text-[10px] text-secondary uppercase">Active Rate</span>
                <span className="font-headline text-xl font-bold">{syncRate}%</span>
              </div>
              <div
                className="w-full h-1 bg-surface-container"
                role="progressbar"
                aria-valuenow={syncRate}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Tasa de actividad"
              >
                <div
                  className="h-full bg-primary-container"
                  style={{ width: `${syncRate}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-label text-[10px] text-secondary uppercase">Total Records</span>
              <span className="font-headline text-xl font-bold">{stats.total}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-r border-outline-variant/20">
          <div className="font-headline text-xs font-bold text-primary-container mb-4 uppercase tracking-tighter">
            Status Distribution
          </div>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((s) => {
              const count = apps.filter((a) => a.status === s).length;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              const style = STATUS_STYLE[s];
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className={`font-label text-[9px] uppercase font-bold w-20 ${style?.text}`}>{s}</span>
                  <div className="flex-1 h-1 bg-surface-container">
                    <div
                      className={`h-full ${style?.bg.replace("/20", "").replace("/40", "")} bg-primary-container`}
                      style={{ width: `${pct}%`, backgroundColor: s === "enviado" ? "#ff5f1f" : s === "rechazado" ? "#93000a" : "#474746" }}
                    />
                  </div>
                  <span className="font-label text-[9px] text-secondary/50 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-surface-container-lowest">
          <div className="font-headline text-xs font-bold text-primary-container mb-4 uppercase tracking-tighter">
            Live Scraper Logs
          </div>
          <div className="font-label text-[9px] text-secondary/60 space-y-1" aria-live="polite" aria-label="Registro de actividad">
            <p>
              <span className="text-primary-container">[INFO]</span>{" "}
              {new Date().toLocaleDateString("es-ES")}: TRACKER_INIT_COMPLETE
            </p>
            <p>
              <span className="text-primary-container">[INFO]</span>{" "}
              DB_RECORDS_LOADED: {stats.total}
            </p>
            <p>
              <span className="text-primary-container">[INFO]</span>{" "}
              FILTER_ACTIVE: {filterStatus.toUpperCase()} // {filterPlatform.toUpperCase()}
            </p>
            <p>
              <span className={stats.total > 0 ? "text-primary-container" : "text-secondary/40"}>
                [{stats.total > 0 ? "SUCCESS" : "WARN"}]
              </span>{" "}
              DISPLAY: {filtered.length}_OF_{stats.total}_RECORDS
            </p>
            <div className="pt-2 terminal-cursor text-primary-container" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Status bar footer */}
      <footer className="p-2 border-t border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest">
        <div className="font-label text-[8px] text-secondary opacity-40 tracking-[0.2em] uppercase">
          LINKEDOUT_CORE_OS // APP_TRACKER_ENGINE // BUILD_ID: 4.0.ALPHA
        </div>
        <div className="flex items-center gap-1" aria-label="Estado del sistema">
          <span className="w-1.5 h-1.5 bg-primary-container rounded-full" aria-hidden="true" />
          <span className="font-label text-[8px] text-primary-container uppercase">Live</span>
        </div>
      </footer>
    </div>
  );
}
