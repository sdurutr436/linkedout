"use client";
import { useState, useRef, useEffect } from "react";

export const KEYWORD_OPTIONS: string[] = [
  "Angular", "AWS", "Data Science", "Docker", "Go", "GraphQL", "Java",
  "Kubernetes", "Machine Learning", "MongoDB", "Next.js", "Node.js",
  "PostgreSQL", "Python", "React", "REST API", "Rust", "TypeScript", "Vue.js",
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function KeywordsSelect({ value, onChange, placeholder = "KEYWORDS..." }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = value.split(",").map((s) => s.trim()).filter(Boolean);

  function toggle(kw: string) {
    const next = selected.includes(kw)
      ? selected.filter((s) => s !== kw)
      : [...selected, kw];
    onChange(next.join(","));
  }

  function remove(kw: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== kw).join(","));
  }

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); setSearch(""); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const filtered = KEYWORD_OPTIONS.filter((kw) =>
    kw.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={0}
        className="w-full min-h-[36px] bg-surface-container border border-outline-variant/40 px-3 py-1.5 flex flex-wrap gap-1.5 items-center cursor-pointer focus:outline-none focus:border-primary-container transition-colors"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen((o) => !o); }}
      >
        {selected.length === 0 ? (
          <span className="font-label text-xs text-secondary/40 uppercase select-none">
            {placeholder}
          </span>
        ) : (
          selected.map((kw) => (
            <span
              key={kw}
              className="flex items-center gap-1 bg-surface-container-high border border-outline-variant/30 font-label text-[10px] text-on-surface px-2 py-0.5 uppercase"
            >
              {kw}
              <button
                type="button"
                onClick={(e) => remove(kw, e)}
                aria-label={`Eliminar ${kw}`}
                className="text-secondary/50 hover:text-error transition-colors leading-none ml-0.5"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-50 top-full left-0 right-0 bg-surface-container-low border border-outline-variant/40 border-t-0 max-h-52 flex flex-col"
        >
          {/* Search */}
          <div className="border-b border-outline-variant/20 px-3 py-2 shrink-0">
            <input
              ref={searchRef}
              type="text"
              className="w-full bg-transparent font-label text-xs text-on-surface placeholder:text-secondary/40 focus:outline-none uppercase"
              placeholder="BUSCAR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options */}
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 font-label text-xs text-secondary/40 uppercase">
                Sin resultados
              </div>
            ) : (
              filtered.map((kw) => {
                const isSelected = selected.includes(kw);
                return (
                  <button
                    key={kw}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={(e) => { e.stopPropagation(); toggle(kw); }}
                    className={[
                      "w-full text-left px-4 py-2 font-body text-sm transition-colors flex items-center gap-3",
                      isSelected
                        ? "text-primary-container bg-surface-container"
                        : "text-on-surface hover:bg-surface-container",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "w-3 h-3 border shrink-0 flex items-center justify-center",
                        isSelected
                          ? "border-primary-container bg-primary-container/20"
                          : "border-outline-variant/40",
                      ].join(" ")}
                    >
                      {isSelected && (
                        <span className="text-primary-container text-[8px] font-bold leading-none">✓</span>
                      )}
                    </span>
                    {kw}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
