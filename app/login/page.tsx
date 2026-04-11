"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      tab === "login" ? { email: form.email, password: form.password } : form;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error desconocido");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm bg-surface-container-low border border-outline-variant/30 p-8">

        {/* Header */}
        <div className="mb-8">
          <div className="font-headline text-2xl font-bold tracking-wider">
            <span className="text-primary-container">LINKED</span>
            <span className="text-on-surface">OUT</span>
            <span className="text-primary-container">_</span>
            <span className="text-secondary text-lg">CORE</span>
          </div>
          <div className="font-label text-[10px] text-secondary/50 uppercase tracking-widest mt-1">
            Authentication required
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex border border-outline-variant/30 mb-6">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              className={[
                "flex-1 py-2 font-headline text-xs font-bold uppercase tracking-wider transition-colors",
                tab === t
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface-container text-secondary hover:bg-surface-container-high",
              ].join(" ")}
            >
              {t === "login" ? "LOGIN" : "REGISTER"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === "register" && (
            <div>
              <label className="block font-label text-[10px] text-secondary/70 uppercase tracking-wider mb-1.5">
                IDENTIFIER
              </label>
              <input
                className="w-full bg-surface-container border border-outline-variant/40 font-body text-sm text-on-surface px-4 py-2.5 focus:outline-none focus:border-primary-container transition-colors placeholder:text-secondary/30"
                placeholder="Tu nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required={tab === "register"}
              />
            </div>
          )}

          <div>
            <label className="block font-label text-[10px] text-secondary/70 uppercase tracking-wider mb-1.5">
              EMAIL_ADDR
            </label>
            <input
              type="email"
              className="w-full bg-surface-container border border-outline-variant/40 font-body text-sm text-on-surface px-4 py-2.5 focus:outline-none focus:border-primary-container transition-colors placeholder:text-secondary/30"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block font-label text-[10px] text-secondary/70 uppercase tracking-wider mb-1.5">
              AUTH_KEY
            </label>
            <input
              type="password"
              className="w-full bg-surface-container border border-outline-variant/40 font-body text-sm text-on-surface px-4 py-2.5 focus:outline-none focus:border-primary-container transition-colors placeholder:text-secondary/30"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <div
              role="alert"
              className="bg-error-container/20 border border-error-container/50 text-error font-label text-xs px-4 py-2.5"
            >
              ERR: {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-container text-on-primary-container font-headline text-xs font-bold py-3 uppercase tracking-wider hover:bg-primary-fixed disabled:opacity-50 transition-colors mt-2"
          >
            {loading
              ? "AUTHENTICATING..."
              : tab === "login"
              ? "AUTHENTICATE"
              : "CREATE_ACCOUNT"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary-container rounded-full" aria-hidden="true" />
          <span className="font-label text-[9px] text-primary-container uppercase">SYS_ONLINE</span>
        </div>
      </div>
    </div>
  );
}
