import { getSession } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session!.sub;

  const [totalApps, sentApps, rejectedApps, acceptedApps] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.application.count({ where: { userId, status: "enviado" } }),
    prisma.application.count({ where: { userId, status: "rechazado" } }),
    prisma.application.count({ where: { userId, status: "aceptado" } }),
  ]);

  const recentApps = await prisma.application.findMany({
    where: { userId },
    orderBy: { appliedAt: "desc" },
    take: 5,
  });

  const cards = [
    { label: "Total solicitudes", value: totalApps, color: "text-blue-400" },
    { label: "Enviadas", value: sentApps, color: "text-yellow-400" },
    { label: "Rechazadas", value: rejectedApps, color: "text-red-400" },
    { label: "Aceptadas", value: acceptedApps, color: "text-green-400" },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-1">
        Hola, {session!.name} 👋
      </h1>
      <p className="text-slate-400 mb-8">Aquí tienes un resumen de tu actividad</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className={`text-3xl font-black ${c.color}`}>{c.value}</p>
            <p className="text-sm text-slate-400 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Solicitudes recientes</h2>
          <Link href="/applications" className="text-sm text-blue-400 hover:text-blue-300">
            Ver todas →
          </Link>
        </div>
        {recentApps.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>Aún no has enviado solicitudes.</p>
            <Link href="/jobs" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
              Buscar ofertas →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-slate-800">
                <th className="text-left pb-2">Empresa</th>
                <th className="text-left pb-2">Puesto</th>
                <th className="text-left pb-2">Plataforma</th>
                <th className="text-left pb-2">Estado</th>
                <th className="text-left pb-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentApps.map((app) => (
                <tr key={app.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-2.5 font-medium text-white">{app.company}</td>
                  <td className="py-2.5 text-slate-300">{app.position}</td>
                  <td className="py-2.5 text-slate-400 capitalize">{app.platform}</td>
                  <td className="py-2.5">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="py-2.5 text-slate-500 text-xs">
                    {new Date(app.appliedAt).toLocaleDateString("es-ES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    enviado: "bg-yellow-900 text-yellow-300 border-yellow-700",
    rechazado: "bg-red-950 text-red-300 border-red-800",
    aceptado: "bg-green-950 text-green-300 border-green-800",
  };
  return (
    <span className={`text-xs border rounded-full px-2 py-0.5 ${map[status] ?? "bg-slate-800 text-slate-400"}`}>
      {status}
    </span>
  );
}
