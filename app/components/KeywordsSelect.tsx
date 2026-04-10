"use client";
import { useEffect, useRef } from "react";
import type Choices from "choices.js";

// ---------------------------------------------------------------------------
// Keyword options — update this list when the user provides it
// ---------------------------------------------------------------------------
export const KEYWORD_OPTIONS: string[] = [
  // TODO: user will provide the full list — add entries here
  "React",
  "TypeScript",
  "Node.js",
  "Next.js",
  "Python",
  "Java",
  "Go",
  "Rust",
  "Vue.js",
  "Angular",
  "AWS",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "MongoDB",
  "GraphQL",
  "REST API",
  "Machine Learning",
  "Data Science",
];

interface Props {
  value: string;         // comma-separated string (stored in preferences)
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function KeywordsSelect({ value, onChange, placeholder = "Añadir palabras clave..." }: Props) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const choicesRef = useRef<Choices | null>(null);

  // Track the latest onChange in a ref so the effect callback doesn't stale-close over it
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!selectRef.current) return;

    let instance: Choices;

    import("choices.js").then(({ default: ChoicesClass }) => {
      if (!selectRef.current) return;

      instance = new ChoicesClass(selectRef.current, {
        removeItemButton: true,
        placeholder: true,
        placeholderValue: placeholder,
        searchPlaceholderValue: "Buscar...",
        noResultsText: "Sin resultados",
        noChoicesText: "Sin opciones disponibles",
        itemSelectText: "",
        classNames: {
          containerOuter: ["choices", "choices--custom"],
        },
      });

      choicesRef.current = instance;

      // Restore initial value
      const initial = value.split(",").map((s) => s.trim()).filter(Boolean);
      initial.forEach((kw) => {
        const option = KEYWORD_OPTIONS.find((o) => o === kw);
        if (option) instance.setChoiceByValue(option);
      });

      selectRef.current.addEventListener("change", () => {
        const selected = Array.from(selectRef.current!.selectedOptions)
          .map((o) => o.value)
          .join(",");
        onChangeRef.current(selected);
      });
    });

    return () => {
      choicesRef.current?.destroy();
      choicesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* choices.js CSS — loaded once via a link tag to avoid style import issues */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css"
      />
      <style>{`
        .choices__inner { background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; color: white; min-height: 2.625rem; }
        .choices__input { background: transparent; color: white; }
        .choices__list--dropdown { background: #1e293b; border: 1px solid #334155; }
        .choices__item--choice:hover, .choices__item--choice.is-highlighted { background: #2563eb; }
        .choices__item--selectable { color: #cbd5e1; }
        .choices__item.is-selected { background: #1e40af; color: white; }
        .choices[data-type*=select-multiple] .choices__button { border-left: 1px solid #334155; }
      `}</style>
      <select ref={selectRef} multiple>
        {KEYWORD_OPTIONS.map((kw) => (
          <option key={kw} value={kw}>
            {kw}
          </option>
        ))}
      </select>
    </>
  );
}
