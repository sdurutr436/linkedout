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
const STATUS_COLORS: Record<string, string> = {
  enviado: "bg-yellow-900 text-yellow-300 border-yellow-700",
  rechazado: "bg-red-950 text-red-300 border-red-800",
  aceptado: "bg-green-950 text-green-300 border-green-800",
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

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Mis Solicitudes</h1>
        <span className="text-slate-400 text-sm">{apps.length} total</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-blue-400" },
          { label: "Enviadas", value: stats.enviado, color: "text-yellow-400" },
          { label: "Rechazadas", value: stats.rechazado, color: "text-red-400" },
          { label: "Aceptadas", value: stats.aceptado, color: "text-green-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
        >
          <option value="all">Todas las plataformas</option>
          <option value="linkedin">LinkedIn</option>
          <option value="infojobs">Infojobs</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          {apps.length === 0
            ? "Aún no has registrado solicitudes. Busca y aplica a ofertas en la sección Ofertas."
            : "No hay solicitudes con los filtros seleccionados."}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-slate-800 bg-slate-900/50">
                <th className="text-left px-4 py-3">Empresa</th>
                <th className="text-left px-4 py-3">Puesto</th>
                <th className="text-left px-4 py-3">Plataforma</th>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Hora</th>
                <th className="text-left px-4 py-3">Contacto</th>
                <th className="text-left px-4 py-3">Salario</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">CV</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => {
                const dt = new Date(app.appliedAt);
                return (
                  <tr key={app.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="px-4 py-3 font-medium text-white">
                      <div>{app.company}</div>
                      {app.companySummary && (
                        <div className="text-xs text-slate-500 mt-0.5 max-w-[140px] truncate" title={app.companySummary}>
                          {app.companySummary}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{app.position}</td>
                    <td className="px-4 py-3 text-slate-400 capitalize">{app.platform}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {dt.toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {dt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {app.contactPerson ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {app.salary ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={app.status}
                        disabled={updating === app.id}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={`text-xs border rounded-full px-2 py-0.5 font-medium cursor-pointer focus:outline-none ${STATUS_COLORS[app.status] ?? "bg-slate-800 text-slate-400"} bg-transparent`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-slate-900 text-white">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {app.optimizedCV ? (
                        <div className="flex gap-1">
                          <a
                            href={`/api/cv/${app.optimizedCV.id}`}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            .md
                          </a>
                          <span className="text-slate-600">|</span>
                          <a
                            href={`/api/cv/${app.optimizedCV.id}?format=pdf`}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            PDF
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(app.id)}
                        disabled={deleting === app.id}
                        className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                      >
                        {deleting === app.id ? "..." : "✕"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
