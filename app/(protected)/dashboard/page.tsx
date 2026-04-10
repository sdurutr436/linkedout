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

  const stats = [
    { label: "TOTAL_RECORDS", value: totalApps, color: "text-on-surface" },
    { label: "ENVIADO", value: sentApps, color: "text-primary-container" },
    { label: "RECHAZADO", value: rejectedApps, color: "text-error" },
    { label: "ACEPTADO", value: acceptedApps, color: "text-secondary-fixed-dim" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <header className="border-b border-outline-variant/30 pb-4">
        <h1 className="font-headline text-3xl font-black tracking-tighter uppercase text-on-background">
          DASHBOARD_CORE
        </h1>
        <p className="font-label text-xs text-primary-container mt-1 tracking-[0.2em]">
          OPERATOR: {session!.name.toUpperCase()} // STATUS: ONLINE
        </p>
      </header>

      {/* Stats grid */}
      <section aria-label="Métricas generales">
        <div className="grid grid-cols-2 md:grid-cols-4 border border-outline-variant/20">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={[
                "p-5 bg-surface-container-low",
                i < stats.length - 1 ? "border-r border-outline-variant/20" : "",
              ].join(" ")}
            >
              <div className="font-label text-[10px] text-secondary uppercase opacity-60 mb-1">
                {s.label}
              </div>
              <div className={`font-headline text-3xl font-black ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section aria-label="Acciones rápidas">
        <div className="font-headline text-[10px] font-bold text-outline uppercase tracking-widest opacity-50 mb-3">
          QUICK_ACCESS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/jobs"
            className="flex items-center gap-3 p-4 bg-surface-container-low border border-outline-variant/20 hover:border-primary-container/40 transition-colors group"
          >
            <span className="material-symbols-outlined text-primary-container" aria-hidden="true">
              precision_manufacturing
            </span>
            <div>
              <div className="font-headline text-xs font-bold uppercase tracking-tighter group-hover:text-primary-container transition-colors">
                JOB_DISCOVERY
              </div>
              <div className="font-label text-[9px] text-secondary/50 mt-0.5">
                Search &amp; scrape job listings
              </div>
            </div>
          </Link>

          <Link
            href="/applications"
            className="flex items-center gap-3 p-4 bg-surface-container-low border border-outline-variant/20 hover:border-primary-container/40 transition-colors group"
          >
            <span className="material-symbols-outlined text-secondary" aria-hidden="true">
              analytics
            </span>
            <div>
              <div className="font-headline text-xs font-bold uppercase tracking-tighter group-hover:text-primary-container transition-colors">
                APP_TRACKER
              </div>
              <div className="font-label text-[9px] text-secondary/50 mt-0.5">
                Manage application pipeline
              </div>
            </div>
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-3 p-4 bg-surface-container-low border border-outline-variant/20 hover:border-primary-container/40 transition-colors group"
          >
            <span className="material-symbols-outlined text-secondary" aria-hidden="true">
              person
            </span>
            <div>
              <div className="font-headline text-xs font-bold uppercase tracking-tighter group-hover:text-primary-container transition-colors">
                OPERATOR_PROFILE
              </div>
              <div className="font-label text-[9px] text-secondary/50 mt-0.5">
                CV, credentials &amp; preferences
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent applications table */}
      <section aria-labelledby="recent-title" className="bg-surface-container-low border border-outline-variant/20">
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/20 bg-surface-container">
          <h2
            id="recent-title"
            className="font-headline text-xs font-bold text-on-surface uppercase tracking-widest"
          >
            RECENT_OPERATIONS
          </h2>
          <Link
            href="/applications"
            className="font-label text-[10px] text-primary-container hover:text-primary transition-colors uppercase"
            aria-label="Ver todas las solicitudes"
          >
            VIEW_ALL →
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <div className="py-12 text-center" role="status">
            <p className="font-headline text-sm text-secondary/30 uppercase tracking-widest">
              NO_RECORDS_FOUND
            </p>
            <Link
              href="/jobs"
              className="inline-block mt-3 font-label text-xs text-primary-container hover:text-primary transition-colors uppercase"
            >
              INITIATE_FIRST_SCRAPE →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th
                    scope="col"
                    className="px-5 py-2 text-left font-label text-[10px] font-bold text-outline uppercase tracking-widest border-r border-outline-variant/10"
                  >
                    COMPANY
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2 text-left font-label text-[10px] font-bold text-outline uppercase tracking-widest border-r border-outline-variant/10"
                  >
                    POSITION
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2 text-left font-label text-[10px] font-bold text-outline uppercase tracking-widest border-r border-outline-variant/10 w-24"
                  >
                    PLATFORM
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2 text-left font-label text-[10px] font-bold text-outline uppercase tracking-widest border-r border-outline-variant/10 w-28"
                  >
                    STATUS
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2 text-left font-label text-[10px] font-bold text-outline uppercase tracking-widest w-28"
                  >
                    DATE
                  </th>
                </tr>
              </thead>
              <tbody className="font-label text-xs">
                {recentApps.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-outline-variant/10 hover:bg-surface-container transition-colors"
                  >
                    <td className="px-5 py-2.5 border-r border-outline-variant/10 font-medium text-on-surface uppercase tracking-tight">
                      {app.company}
                    </td>
                    <td className="px-5 py-2.5 border-r border-outline-variant/10 text-secondary">
                      {app.position}
                    </td>
                    <td className="px-5 py-2.5 border-r border-outline-variant/10">
                      <span className="font-label text-[9px] bg-surface-container-highest border border-outline-variant/30 px-2 py-0.5 uppercase text-secondary">
                        {app.platform.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 border-r border-outline-variant/10">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-2.5 text-secondary/50">
                      <time dateTime={app.appliedAt.toString()}>
                        {new Date(app.appliedAt).toLocaleDateString("es-ES")}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* System status footer */}
      <footer
        className="border border-outline-variant/20 bg-surface-container-lowest p-3 flex justify-between items-center"
        aria-label="Estado del sistema"
      >
        <span className="font-label text-[8px] text-secondary/40 uppercase tracking-[0.2em]">
          LINKEDOUT_CORE_OS // DASHBOARD_ENGINE // BUILD_ID: 4.0.ALPHA
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse" aria-hidden="true" />
          <span className="font-label text-[8px] text-primary-container uppercase">SYS_ONLINE</span>
        </div>
      </footer>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    enviado: "bg-primary-container/20 text-primary-container border-primary-container/50",
    rechazado: "bg-error-container/20 text-error border-error-container/50",
    aceptado: "bg-secondary-container/40 text-secondary-fixed-dim border-outline-variant/40",
  };
  return (
    <span
      className={`font-label text-[9px] font-bold border px-2 py-0.5 uppercase ${
        map[status] ?? "bg-surface-container text-secondary border-outline-variant/30"
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
}
