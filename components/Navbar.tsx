"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard", label: "DASHBOARD", icon: "dashboard" },
  { href: "/jobs", label: "JOB_DISCOVERY", icon: "precision_manufacturing" },
  { href: "/applications", label: "APP_TRACKER", icon: "analytics" },
  { href: "/profile", label: "OPERATOR_PROFILE", icon: "person" },
];

export default function Navbar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      aria-label="Navegación principal"
      className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant/20 flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-4 border-b border-outline-variant/20 bg-surface-container-lowest">
        <div className="font-headline text-lg font-black text-primary-container tracking-widest">
          LINKEDOUT_CORE
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div
            className="w-10 h-10 bg-surface-container-high border border-outline-variant/30 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-primary-container">engineering</span>
          </div>
          <div>
            <p className="font-headline text-xs font-black text-primary-container leading-none uppercase truncate max-w-[140px]">
              {user.name}
            </p>
            <p className="font-label text-[10px] text-secondary opacity-60 mt-0.5 truncate max-w-[140px]">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Secciones de la aplicación" className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-2">
          <span className="font-label text-[10px] text-outline tracking-[0.2em] font-bold opacity-50 uppercase">
            Core Console
          </span>
        </div>
        <ul role="list" className="flex flex-col gap-0.5 px-2">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex items-center gap-3 px-3 py-3 font-headline text-xs font-medium uppercase transition-all duration-75",
                    active
                      ? "bg-surface-container-high text-primary-container border-l-4 border-primary-container"
                      : "text-secondary opacity-70 hover:bg-surface-container-high hover:opacity-100 border-l-4 border-transparent",
                  ].join(" ")}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Initiate Scrape CTA */}
      <div className="px-4 pb-2">
        <Link
          href="/jobs"
          className="block w-full py-3 bg-surface-container-high border border-primary-container/30 text-primary-container font-headline text-xs font-bold uppercase tracking-widest text-center hover:bg-primary-container hover:text-on-primary transition-all duration-75"
        >
          INITIATE_SCRAPE
        </Link>
      </div>

      {/* Footer links + logout */}
      <div className="border-t border-outline-variant/20 p-2 flex flex-col gap-0.5 bg-surface-container-lowest">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-secondary opacity-60 hover:bg-surface-container hover:opacity-100 font-headline text-[10px] uppercase transition-all w-full text-left"
          aria-label="Cerrar sesión"
        >
          <span className="material-symbols-outlined text-xs" aria-hidden="true">logout</span>
          FORCE_SHUTDOWN
        </button>
        <div
          className="flex items-center gap-3 px-4 py-2 text-secondary opacity-40 font-headline text-[10px] uppercase"
          aria-label="Estado del sistema"
        >
          <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse" aria-hidden="true" />
          SYS_ONLINE
        </div>
      </div>
    </aside>
  );
}
