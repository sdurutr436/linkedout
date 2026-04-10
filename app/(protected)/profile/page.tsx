"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const KeywordsSelect = dynamic(() => import("@/app/components/KeywordsSelect"), { ssr: false });

interface Preferences {
  keywords: string;
  location: string;
  jobType: string;
  salaryMin: string;
}

interface ProfileData {
  cvContent: string;
  cvFileName: string;
  titulaciones: string;
  experiencia: string;
  linkedinEmail: string;
  linkedinPassword: string;
  infojobsEmail: string;
  infojobsConnected: boolean;
  preferences: Preferences;
}

const defaultPreferences: Preferences = {
  keywords: "",
  location: "",
  jobType: "fulltime",
  salaryMin: "",
};

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<ProfileData>({
    cvContent: "",
    cvFileName: "",
    titulaciones: "",
    experiencia: "",
    linkedinEmail: "",
    linkedinPassword: "",
    infojobsEmail: "",
    infojobsConnected: false,
    preferences: defaultPreferences,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLinkedinPw, setShowLinkedinPw] = useState(false);
  const [showInfojobsPw, setShowInfojobsPw] = useState(false);
  const [tab, setTab] = useState<"cv" | "preferences">("cv");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ profile }) => {
        if (!profile) return;
        setForm({
          cvContent: profile.cvContent ?? "",
          cvFileName: profile.cvFileName ?? "",
          titulaciones: profile.titulaciones ?? "",
          experiencia: profile.experiencia ?? "",
          linkedinEmail: profile.linkedinEmail ?? "",
          linkedinPassword: profile.linkedinPassword ?? "",
          infojobsEmail: profile.infojobsEmail ?? "",
          infojobsConnected: !!profile.infojobsToken,
          preferences: profile.preferences ? JSON.parse(profile.preferences) : defaultPreferences,
        });
      });
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, cvContent: ev.target?.result as string, cvFileName: file.name }));
    };
    reader.readAsText(file);
  }

  async function handleSave() {
    setSaving(true);
    const { infojobsConnected, ...payload } = form;
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const cvLines = form.cvContent.split("\n");
  const infojobsConnected =
    form.infojobsConnected || searchParams.get("infojobs") === "connected";

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <header className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tighter uppercase text-on-background">
            PROFILE_SYSTEM_V.4
          </h1>
          <p className="font-label text-xs text-primary-container mt-1 tracking-[0.2em]">
            ACCESSING SECURE DATA NODES // STATUS: ENCRYPTED
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          aria-label={saving ? "Guardando cambios" : saved ? "Cambios guardados" : "Guardar cambios"}
          className="bg-primary-container text-on-primary-container font-headline text-xs font-black px-4 py-2 uppercase tracking-widest hover:bg-primary-fixed disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">save</span>
          {saving ? "SAVING..." : saved ? "SAVED_OK" : "SAVE_CHANGES"}
        </button>
      </header>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: CV Editor */}
        <section aria-labelledby="cv-editor-title" className="lg:col-span-8 flex flex-col">
          {/* Tab navigation */}
          <div
            role="tablist"
            aria-label="Secciones del perfil"
            className="flex border-b border-outline-variant/30 mb-0"
          >
            <button
              role="tab"
              aria-selected={tab === "cv"}
              aria-controls="panel-cv"
              id="tab-cv"
              onClick={() => setTab("cv")}
              className={[
                "px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest transition-colors",
                tab === "cv"
                  ? "text-primary-container border-b-2 border-primary-container"
                  : "text-secondary opacity-60 hover:opacity-100",
              ].join(" ")}
            >
              BASE_CURRICULUM
            </button>
            <button
              role="tab"
              aria-selected={tab === "preferences"}
              aria-controls="panel-preferences"
              id="tab-preferences"
              onClick={() => setTab("preferences")}
              className={[
                "px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest transition-colors",
                tab === "preferences"
                  ? "text-primary-container border-b-2 border-primary-container"
                  : "text-secondary opacity-60 hover:opacity-100",
              ].join(" ")}
            >
              SEARCH_PARAMS
            </button>
          </div>

          {tab === "cv" && (
            <div
              id="panel-cv"
              role="tabpanel"
              aria-labelledby="tab-cv"
              className="bg-surface-container-low border border-outline-variant/20 flex flex-col h-[600px]"
            >
              {/* Editor toolbar */}
              <div className="bg-surface-container flex items-center justify-between px-3 h-8 border-b border-outline-variant/20">
                <div className="flex items-center gap-4">
                  <span className="font-headline text-[10px] font-bold text-secondary flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs" aria-hidden="true">description</span>
                    BASE_CURRICULUM.RAW
                  </span>
                  <div className="h-3 w-px bg-outline-variant/30" aria-hidden="true" />
                  <span className="font-headline text-[10px] text-primary-container">
                    L: {cvLines.length.toString().padStart(3, "0")} // UTF-8
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="cv-file-upload"
                    className="font-headline text-[9px] text-secondary opacity-60 hover:opacity-100 cursor-pointer uppercase tracking-widest transition-opacity"
                  >
                    LOAD_FILE
                  </label>
                  <input
                    id="cv-file-upload"
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileChange}
                    className="sr-only"
                    aria-label="Cargar archivo de CV"
                  />
                  {form.cvFileName && (
                    <span className="font-label text-[9px] text-primary-container truncate max-w-[120px]">
                      {form.cvFileName}
                    </span>
                  )}
                </div>
              </div>

              {/* Editor body */}
              <div className="flex-1 flex font-label text-sm overflow-hidden">
                {/* Line numbers */}
                <div
                  className="w-10 bg-surface-container-lowest border-r border-outline-variant/20 py-4 px-2 text-secondary/30 select-none overflow-hidden flex flex-col items-end text-[11px] leading-[22px]"
                  aria-hidden="true"
                >
                  {Array.from({ length: Math.max(cvLines.length, 16) }, (_, i) => (
                    <span key={i}>{String(i + 1).padStart(2, "0")}</span>
                  ))}
                </div>

                {/* Text area */}
                <div className="flex-1 relative bg-surface-container-lowest">
                  <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    aria-hidden="true"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,95,31,0.1) 1px, transparent 1px)",
                      backgroundSize: "100% 22px",
                    }}
                  />
                  <textarea
                    id="cv-editor"
                    aria-label="Contenido del CV en texto plano o markdown"
                    className="absolute inset-0 w-full h-full bg-transparent border-none p-4 text-secondary text-xs font-label leading-[22px] resize-none focus:outline-none focus:ring-1 focus:ring-primary-container/50"
                    placeholder="# NAME: ENGINEER_PROX_01&#10;# CLASS: FULL_STACK_ARCHITECT&#10;&#10;> STACK: TYPESCRIPT // PYTHON // RUST&#10;..."
                    value={form.cvContent}
                    onChange={(e) => setForm({ ...form, cvContent: e.target.value })}
                  />
                </div>
              </div>

              {/* Editor footer */}
              <div className="h-6 bg-surface-container-high border-t border-outline-variant/20 px-3 flex items-center justify-between">
                <span className="font-label text-[9px] text-secondary/50 uppercase">
                  UTF-8 // CRLF // RAW_MODE
                </span>
                <span className="font-label text-[9px] text-secondary/50 uppercase tracking-widest">
                  {form.cvFileName ? `FILE: ${form.cvFileName}` : "NO_FILE_LOADED"}
                </span>
              </div>
            </div>
          )}

          {tab === "cv" && (
            /* Titulaciones + Experiencia below the editor */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-surface-container-low border border-outline-variant/20 p-4">
                <label
                  htmlFor="titulaciones"
                  className="block font-headline text-[10px] font-bold text-secondary/70 tracking-widest uppercase mb-2"
                >
                  TITULACIONES_BLOCK
                </label>
                <textarea
                  id="titulaciones"
                  rows={5}
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 font-label text-xs px-3 py-2 text-secondary focus:outline-none focus:border-primary-container resize-none transition-colors"
                  placeholder="Grado en Ingeniería Informática, Univ. X, 2018&#10;Máster en IA, Univ. Y, 2020"
                  value={form.titulaciones}
                  onChange={(e) => setForm({ ...form, titulaciones: e.target.value })}
                />
              </div>
              <div className="bg-surface-container-low border border-outline-variant/20 p-4">
                <label
                  htmlFor="experiencia"
                  className="block font-headline text-[10px] font-bold text-secondary/70 tracking-widest uppercase mb-2"
                >
                  EXPERIENCE_LOG
                </label>
                <textarea
                  id="experiencia"
                  rows={5}
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 font-label text-xs px-3 py-2 text-secondary focus:outline-none focus:border-primary-container resize-none transition-colors"
                  placeholder="Software Engineer en Empresa X (2020–2023)&#10;- React / Node.js / TypeScript"
                  value={form.experiencia}
                  onChange={(e) => setForm({ ...form, experiencia: e.target.value })}
                />
              </div>
            </div>
          )}

          {tab === "preferences" && (
            <div
              id="panel-preferences"
              role="tabpanel"
              aria-labelledby="tab-preferences"
              className="bg-surface-container-low border border-outline-variant/20 p-6 space-y-5"
            >
              <div>
                <label className="block font-headline text-[10px] font-bold text-secondary/70 tracking-widest uppercase mb-2">
                  KEYWORDS_FILTER
                </label>
                <KeywordsSelect
                  value={form.preferences.keywords}
                  onChange={(v) =>
                    setForm({ ...form, preferences: { ...form.preferences, keywords: v } })
                  }
                  placeholder="Añadir palabras clave..."
                />
              </div>
              <div>
                <label
                  htmlFor="pref-location"
                  className="block font-headline text-[10px] font-bold text-secondary/70 tracking-widest uppercase mb-2"
                >
                  LOCATION_CLUSTER
                </label>
                <input
                  id="pref-location"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 font-label text-sm px-4 py-3 text-secondary focus:outline-none focus:border-primary-container transition-colors"
                  placeholder="Madrid, España / Remoto"
                  value={form.preferences.location}
                  onChange={(e) =>
                    setForm({ ...form, preferences: { ...form.preferences, location: e.target.value } })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="pref-jobtype"
                  className="block font-headline text-[10px] font-bold text-secondary/70 tracking-widest uppercase mb-2"
                >
                  CONTRACT_TYPE
                </label>
                <select
                  id="pref-jobtype"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 font-label text-sm px-4 py-3 text-secondary focus:outline-none focus:border-primary-container transition-colors"
                  value={form.preferences.jobType}
                  onChange={(e) =>
                    setForm({ ...form, preferences: { ...form.preferences, jobType: e.target.value } })
                  }
                >
                  <option value="fulltime">FULLTIME</option>
                  <option value="parttime">PARTTIME</option>
                  <option value="contract">CONTRACT / FREELANCE</option>
                  <option value="internship">INTERNSHIP</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="pref-salary"
                  className="block font-headline text-[10px] font-bold text-secondary/70 tracking-widest uppercase mb-2"
                >
                  SALARY_FLOOR (€/año)
                </label>
                <input
                  id="pref-salary"
                  type="number"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 font-label text-sm px-4 py-3 text-secondary focus:outline-none focus:border-primary-container transition-colors"
                  placeholder="30000"
                  value={form.preferences.salaryMin}
                  onChange={(e) =>
                    setForm({ ...form, preferences: { ...form.preferences, salaryMin: e.target.value } })
                  }
                />
              </div>
            </div>
          )}
        </section>

        {/* Right column */}
        <aside aria-label="Vault de credenciales y estado de nodos" className="lg:col-span-4 space-y-6">
          {/* Secure Vault */}
          <section
            aria-labelledby="vault-title"
            className="bg-surface-container-low border border-outline-variant/20 p-5 relative overflow-hidden"
          >
            <div
              className="absolute top-0 right-0 w-20 h-20 opacity-[0.06] rotate-12 -mr-6 -mt-6 pointer-events-none"
              aria-hidden="true"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 80 }}>enhanced_encryption</span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary-container" aria-hidden="true">lock</span>
              <h2
                id="vault-title"
                className="font-headline text-lg font-black uppercase tracking-tighter"
              >
                SECURE_VAULT
              </h2>
            </div>

            <div className="space-y-6">
              {/* LinkedIn credentials */}
              <fieldset className="space-y-2">
                <div className="flex justify-between items-center">
                  <legend className="font-headline text-[10px] font-bold text-secondary/70 tracking-widest uppercase">
                    LINKEDIN_AUTH
                  </legend>
                  <span className="font-label text-[9px] text-primary-container">ENCRYPTED_AES_256</span>
                </div>

                <div>
                  <label htmlFor="linkedin-email" className="sr-only">
                    Email de LinkedIn
                  </label>
                  <input
                    id="linkedin-email"
                    type="email"
                    className="w-full bg-surface-container-lowest border border-outline-variant/40 font-label text-sm px-4 py-2 text-secondary focus:outline-none focus:border-primary-container transition-colors mb-2"
                    placeholder="email@ejemplo.com"
                    value={form.linkedinEmail}
                    onChange={(e) => setForm({ ...form, linkedinEmail: e.target.value })}
                  />
                </div>

                <div className="relative">
                  <label htmlFor="linkedin-password" className="sr-only">
                    Contraseña de LinkedIn
                  </label>
                  <input
                    id="linkedin-password"
                    type={showLinkedinPw ? "text" : "password"}
                    className="w-full bg-surface-container-lowest border border-outline-variant/40 font-label text-sm px-4 py-3 pr-10 text-secondary focus:outline-none focus:border-primary-container transition-colors"
                    placeholder="••••••••••••••••"
                    value={form.linkedinPassword}
                    onChange={(e) => setForm({ ...form, linkedinPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLinkedinPw(!showLinkedinPw)}
                    aria-label={showLinkedinPw ? "Ocultar contraseña de LinkedIn" : "Mostrar contraseña de LinkedIn"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">
                      {showLinkedinPw ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                <p className="font-label text-[9px] text-secondary/40">
                  Credentials used for Playwright scraping — LinkedIn has no public job API.
                </p>
              </fieldset>

              {/* Infojobs credentials */}
              <fieldset className="space-y-2">
                <div className="flex justify-between items-center">
                  <legend className="font-headline text-[10px] font-bold text-secondary/70 tracking-widest uppercase">
                    INFOJOBS_API
                  </legend>
                  <span
                    className={`font-label text-[9px] ${infojobsConnected ? "text-primary-container" : "text-secondary/40"}`}
                  >
                    {infojobsConnected ? "SESSION_ACTIVE" : "NOT_CONNECTED"}
                  </span>
                </div>

                <div>
                  <label htmlFor="infojobs-email" className="sr-only">
                    Email de Infojobs (referencia)
                  </label>
                  <input
                    id="infojobs-email"
                    type="email"
                    className="w-full bg-surface-container-lowest border border-outline-variant/40 font-label text-sm px-4 py-2 text-secondary focus:outline-none focus:border-primary-container transition-colors mb-2"
                    placeholder="email@ejemplo.com (opcional)"
                    value={form.infojobsEmail}
                    onChange={(e) => setForm({ ...form, infojobsEmail: e.target.value })}
                  />
                </div>

                {infojobsConnected ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-primary-container/10 border border-primary-container/30">
                    <span
                      className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse"
                      aria-hidden="true"
                    />
                    <span className="font-label text-xs text-primary-container">
                      OAuth token active
                    </span>
                  </div>
                ) : (
                  <a
                    href="/api/auth/infojobs"
                    className="block w-full text-center border border-primary-container/40 text-primary-container font-headline text-xs font-black py-3 tracking-[0.1em] hover:bg-primary-container/10 transition-all uppercase"
                  >
                    CONNECT_INFOJOBS_OAUTH
                  </a>
                )}
              </fieldset>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full border border-primary-container/40 text-primary-container font-headline text-xs font-black py-3 tracking-[0.2em] hover:bg-primary-container/10 transition-all uppercase disabled:opacity-50"
              >
                {saving ? "UPDATING..." : "UPDATE_CREDENTIALS_BLOCK"}
              </button>
            </div>
          </section>

          {/* Account Nodes */}
          <section aria-labelledby="nodes-title" className="bg-surface-container-low border border-outline-variant/20 p-5">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-secondary" aria-hidden="true">hub</span>
              <h2
                id="nodes-title"
                className="font-headline text-lg font-black uppercase tracking-tighter text-secondary"
              >
                ACCOUNT_NODES
              </h2>
            </div>

            <ul role="list" className="space-y-3">
              {/* LinkedIn node */}
              <li className="flex items-center justify-between p-3 bg-surface-container-lowest border-l-2 border-primary-container">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 bg-surface-container-high flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ color: "#0077B5" }}>link</span>
                  </div>
                  <div>
                    <p className="font-headline text-[10px] font-black text-secondary">LINKEDIN_NODE</p>
                    <p className="font-label text-[9px] text-secondary/50">SCRAPER: PLAYWRIGHT</p>
                  </div>
                </div>
                <div className="flex flex-col items-end" aria-label="Estado: activo">
                  <span className="flex items-center gap-1 font-label text-[10px] text-primary-container">
                    <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse" aria-hidden="true" />
                    ACTIVE
                  </span>
                  <span className="font-label text-[8px] text-secondary/30 mt-1">PLAYWRIGHT_V2</span>
                </div>
              </li>

              {/* Infojobs node */}
              <li
                className={[
                  "flex items-center justify-between p-3 bg-surface-container-lowest border-l-2",
                  infojobsConnected ? "border-primary-container" : "border-outline-variant/30 opacity-50 grayscale",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 bg-surface-container-high flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ color: "#ff6000" }}>work</span>
                  </div>
                  <div>
                    <p className="font-headline text-[10px] font-black text-secondary">INFOJOBS_NODE</p>
                    <p className="font-label text-[9px] text-secondary/50">API: REST_v9</p>
                  </div>
                </div>
                <div
                  className="flex flex-col items-end"
                  aria-label={`Estado: ${infojobsConnected ? "conectado" : "no conectado"}`}
                >
                  {infojobsConnected ? (
                    <>
                      <span className="flex items-center gap-1 font-label text-[10px] text-primary-container">
                        <span className="w-1.5 h-1.5 bg-primary-container rounded-full" aria-hidden="true" />
                        SYNCED
                      </span>
                      <span className="font-label text-[8px] text-secondary/30 mt-1">OAUTH_2.0</span>
                    </>
                  ) : (
                    <span className="font-label text-[10px] text-secondary/40">STANDBY</span>
                  )}
                </div>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
