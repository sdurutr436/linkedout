"use client";
import { useEffect, useState } from "react";

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
  infojobsPassword: string;
  preferences: Preferences;
}

const defaultPreferences: Preferences = {
  keywords: "",
  location: "",
  jobType: "fulltime",
  salaryMin: "",
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileData>({
    cvContent: "",
    cvFileName: "",
    titulaciones: "",
    experiencia: "",
    linkedinEmail: "",
    linkedinPassword: "",
    infojobsEmail: "",
    infojobsPassword: "",
    preferences: defaultPreferences,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"cv" | "credentials" | "preferences">("cv");

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
          infojobsPassword: profile.infojobsPassword ?? "",
          preferences: profile.preferences ? JSON.parse(profile.preferences) : defaultPreferences,
        });
      });
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({
        ...f,
        cvContent: ev.target?.result as string,
        cvFileName: file.name,
      }));
    };
    reader.readAsText(file);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabClass = (t: typeof tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? "border-blue-500 text-blue-400"
        : "border-transparent text-slate-400 hover:text-white"
    }`;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Mi Perfil</h1>

      <div className="flex gap-0 border-b border-slate-800 mb-6">
        <button className={tabClass("cv")} onClick={() => setTab("cv")}>CV & Experiencia</button>
        <button className={tabClass("credentials")} onClick={() => setTab("credentials")}>Credenciales</button>
        <button className={tabClass("preferences")} onClick={() => setTab("preferences")}>Preferencias</button>
      </div>

      {tab === "cv" && (
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Subir CV (texto plano o .md)</label>
            <input
              type="file"
              accept=".txt,.md"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-500"
            />
            {form.cvFileName && (
              <p className="text-xs text-slate-500 mt-1">Archivo cargado: {form.cvFileName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Contenido del CV</label>
            <textarea
              rows={10}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="Pega aquí el contenido de tu CV en texto plano o markdown..."
              value={form.cvContent}
              onChange={(e) => setForm({ ...form, cvContent: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Titulaciones</label>
            <textarea
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="Grado en Ingeniería Informática, Universidad X, 2018&#10;Máster en IA, Universidad Y, 2020"
              value={form.titulaciones}
              onChange={(e) => setForm({ ...form, titulaciones: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Experiencia laboral</label>
            <textarea
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="Software Engineer en Empresa X (2020-2023)&#10;- Desarrollé features en React/Node.js&#10;..."
              value={form.experiencia}
              onChange={(e) => setForm({ ...form, experiencia: e.target.value })}
            />
          </div>
        </div>
      )}

      {tab === "credentials" && (
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              LinkedIn
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  value={form.linkedinEmail}
                  onChange={(e) => setForm({ ...form, linkedinEmail: e.target.value })}
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Contraseña</label>
                <input
                  type="password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  value={form.linkedinPassword}
                  onChange={(e) => setForm({ ...form, linkedinPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Infojobs
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  value={form.infojobsEmail}
                  onChange={(e) => setForm({ ...form, infojobsEmail: e.target.value })}
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Contraseña</label>
                <input
                  type="password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  value={form.infojobsPassword}
                  onChange={(e) => setForm({ ...form, infojobsPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Las credenciales se almacenan localmente en tu base de datos y solo se usan para automatizar el inicio de sesión.
          </p>
        </div>
      )}

      {tab === "preferences" && (
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Palabras clave</label>
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="React, TypeScript, Node.js..."
              value={form.preferences.keywords}
              onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, keywords: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Ubicación</label>
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="Madrid, España / Remoto"
              value={form.preferences.location}
              onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, location: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tipo de jornada</label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              value={form.preferences.jobType}
              onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, jobType: e.target.value } })}
            >
              <option value="fulltime">Jornada completa</option>
              <option value="parttime">Media jornada</option>
              <option value="contract">Contrato / Freelance</option>
              <option value="internship">Prácticas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Salario mínimo (€/año)</label>
            <input
              type="number"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="30000"
              value={form.preferences.salaryMin}
              onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, salaryMin: e.target.value } })}
            />
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
