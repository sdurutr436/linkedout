"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/jobs", label: "Ofertas", icon: "⚲" },
  { href: "/applications", label: "Solicitudes", icon: "⊞" },
  { href: "/profile", label: "Perfil", icon: "⊙" },
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
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-blue-500">Linked</span>
          <span className="text-xl font-black text-white">Out</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">Automatización de empleo</p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-white truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-950 rounded-lg transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
