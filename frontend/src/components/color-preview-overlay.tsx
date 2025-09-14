"use client";

import { useState, useEffect, useRef } from "react";
import { Palette, X, RotateCcw, Copy, Check } from "lucide-react";

const PRESETS = [
  { id: "blue-teal", name: "Blue + Teal", primary: "#2563eb", secondary: "#ccfbf1" },
  { id: "teal-blue", name: "Teal + Blue", primary: "#0d9488", secondary: "#dbeafe" },
  { id: "orange-teal", name: "Orange + Teal", primary: "#f59e0b", secondary: "#ccfbf1" },
  { id: "purple-blue", name: "Purple + Blue", primary: "#8b5cf6", secondary: "#dbeafe" },
  { id: "blue-teal", name: "Blue + Teal", primary: "#3b82f6", secondary: "#0d9488" },
] as const;

const STORAGE_KEY = 'cvgenix-color-preview';
const STORAGE_PRESET = 'cvgenix-color-preset';

function rgbToHex(rgb: string): string {
  const result = rgb.match(/\d+/g);
  if (!result) return '#0d9488';
  const r = parseInt(result[0]).toString(16).padStart(2, '0');
  const g = parseInt(result[1]).toString(16).padStart(2, '0');
  const b = parseInt(result[2]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function getVar(varName: string): string {
  const el = document.documentElement;
  const value = getComputedStyle(el).getPropertyValue(varName).trim();
  if (!value) return '#0d9488';
  if (value.startsWith('#')) return value;
  if (value.startsWith('rgb')) return rgbToHex(value);
  return '#0d9488';
}

function setVar(varName: string, value: string) {
  document.documentElement.style.setProperty(varName, value);
}

function getInitialDefaults(): Record<string, string> {
  return {
    primary: getVar('--color-primary'),
    secondary: getVar('--color-secondary'),
  };
}

export const ColorPreviewOverlay = () => {
  const [open, setOpen] = useState(false);
  const [colors, setColors] = useState<Record<string, string>>(() => getInitialDefaults());
  const originalRef = useRef<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<string>(
    () => typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_PRESET) || PRESETS[0].id) : PRESETS[0].id
  );

  useEffect(() => {
    originalRef.current = getInitialDefaults();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, string>;
        const next = { ...originalRef.current };
        if (typeof parsed.primary === 'string') next.primary = parsed.primary;
        if (typeof parsed.secondary === 'string') next.secondary = parsed.secondary;
        setColors(next);
        applyColors(next);
      }
      const sp = localStorage.getItem(STORAGE_PRESET);
      if (sp) setSelected(sp);
    } catch {
      // noop
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('button[aria-label="Toggle theme colors"]')
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  function applyColors(next: { primary: string; secondary: string }) {
    // Set long and short vars for Tailwind tokens
    setVar('--color-primary', next.primary);
    setVar('--primary', next.primary);
    setVar('--color-secondary', next.secondary);
    setVar('--secondary', next.secondary);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // noop
    }
  }

  function resetColors() {
    setColors(originalRef.current);
    applyColors(originalRef.current as { primary: string; secondary: string });
  }

  function copyCSS() {
    const lines = [':root {'];
    lines.push(`  --color-primary: ${colors.primary};`);
    lines.push(`  --color-secondary: ${colors.secondary};`);
    lines.push('}');
    const code = lines.join('\n');
    if (navigator) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      });
    }
  }

  return (
    <>
      <button
        aria-label="Toggle theme colors"
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-50 size-12 rounded-full bg-card text-card-foreground shadow-lg border flex items-center justify-center hover:scale-105 active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-brand outline-none"
      >
        <Palette className="w-5 h-5" />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-20 right-4 z-50 w-80 rounded-xl border bg-card text-card-foreground shadow-lg animate-in slide-in-from-bottom-2"
        >
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="text-sm font-semibold font-display">Choose color combo</h3>
            <div className="flex items-center gap-2">
              <button
                aria-label="Reset colors"
                type="button"
                onClick={resetColors}
                className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-brand outline-none"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                aria-label="Close"
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-brand outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3 space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p.id)}
                  className={`flex items-center justify-between rounded-lg border p-2 text-left hover:bg-muted transition-colors ${selected === p.id ? 'ring-2 ring-brand' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-6 h-6 rounded" style={{ backgroundColor: p.primary }} />
                    <span className="inline-block w-6 h-6 rounded" style={{ backgroundColor: p.secondary }} />
                    <span className="text-sm">{p.name}</span>
                  </div>
                  {selected === p.id && <span className="text-xs text-muted-foreground">Selected</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 pb-3 space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const p = PRESETS.find((x) => x.id === selected) || PRESETS[0];
                  const next = { primary: p.primary, secondary: p.secondary };
                  setColors(next);
                  applyColors(next);
                  try { localStorage.setItem(STORAGE_PRESET, p.id); } catch {}
                }}
                className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-md bg-[var(--color-brand)] text-white hover:opacity-90 active:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-brand outline-none"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={copyCSS}
                className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-md border hover:bg-muted"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy CSS'}
              </button>
            </div>
            <div className="text-xs text-muted text-center">Applies only Primary + Secondary.</div>
          </div>
        </div>
      )}
    </>
  );
};