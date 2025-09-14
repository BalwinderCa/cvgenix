"use client";

import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import { Document as DocxDocument, Packer, Paragraph, TextRun } from "docx";

type Tone = "formal" | "friendly" | "confident" | "concise" | "enthusiastic";
type Template = "classic" | "modern" | "minimalist";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  company: string;
  role: string;
  hiringManager: string;
  tone: Tone;
  template: Template;
  opening: string;
  highlights: string;
  closing: string;
  companyAddress: string;
  referral: boolean;
  referralName: string;
}

const initialState: FormState = {
  fullName: "Alex Johnson",
  email: "alex.johnson@example.com",
  phone: "+1 (555) 012-3456",
  city: "San Francisco, CA",
  company: "Acme Corp",
  role: "Senior Product Designer",
  hiringManager: "Hiring Manager",
  tone: "formal",
  template: "classic",
  opening: "I am writing to express my interest in the role and to share how my background aligns with your team's needs.",
  highlights: "• 6+ years leading end-to-end design for SaaS products\n• Shipped accessible, scalable systems across web and mobile\n• Strong collaboration with PM, Engineering, and Research",
  closing: "Thank you for your time and consideration. I would welcome the opportunity to discuss how I can contribute to your team.",
  companyAddress: "",
  referral: false,
  referralName: "",
};

function formatToday(): string {
  const d = new Date();
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function composeLetter(f: FormState): string {
  const greeting = f.tone === "friendly" ? `Hi ${f.hiringManager || "there"},` : `Dear ${f.hiringManager || "Hiring Manager"},`;
  const opener = f.opening.trim();
  const roleLine = f.role ? (f.tone === "friendly" ? `I'm excited about the ${f.role} role at ${f.company}.` : `I am excited to apply for the ${f.role} position at ${f.company}.`) : "";
  const valueLine = f.tone === "friendly"
    ? "I love turning complex problems into simple, inclusive experiences that help teams move faster."
    : "I specialize in translating complex requirements into inclusive, high-quality experiences that drive measurable outcomes.";
  const referralLine = f.referral && f.referralName
    ? (f.tone === "friendly"
        ? `I was referred by ${f.referralName}, who thought my background would be a strong fit.`
        : `I was referred by ${f.referralName}, who believes my experience aligns well with the role.`)
    : "";
  const highlights = f.highlights.trim();
  const close = f.closing.trim();
  const signOff = f.tone === "friendly" ? "Best regards," : "Sincerely,";

  return [
    formatToday(),
    "",
    `${f.company}`,
    `${f.companyAddress || ""}`,
    `${f.city || ""}`,
    "",
    greeting,
    "",
    [roleLine, opener, referralLine, valueLine].filter(Boolean).join(" \n\n"),
    "",
    highlights,
    "",
    close,
    "",
    signOff,
    f.fullName,
    `${f.email} · ${f.phone}`,
  ].filter(Boolean).join("\n");
}

export const CoverLetterBuilder = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [isCopied, setIsCopied] = useState(false);

  const letter = useMemo(() => composeLetter(form), [form]);
  const templateClasses = useMemo(() => {
    switch (form.template) {
      case "modern":
        return "bg-white text-foreground rounded-xl shadow-md border border-border";
      case "minimalist":
        return "bg-white text-foreground rounded-md shadow-sm";
      default:
        return "bg-white text-foreground rounded-lg shadow-sm"; // classic
    }
  }, [form.template]);

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const updateCheckbox = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.checked }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letter);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([letter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.fullName.replace(/\s+/g, "-")}-cover-letter.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 56; // ~0.75in
    const marginY = 56;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - marginX * 2;
    const lines = doc.splitTextToSize(letter, maxWidth);
    doc.setFont("Times", "Normal");
    doc.setFontSize(12);
    let cursorY = marginY;
    const lineHeight = 16;
    lines.forEach((l: string) => {
      if (cursorY > doc.internal.pageSize.getHeight() - marginY) {
        doc.addPage();
        cursorY = marginY;
      }
      doc.text(l, marginX, cursorY);
      cursorY += lineHeight;
    });
    doc.save(`${form.fullName.replace(/\s+/g, "-")}-cover-letter.pdf`);
  };

  const handleDownloadDOCX = async () => {
    const paragraphs = letter.split("\n").map((line) =>
      new Paragraph({ children: [new TextRun(line || " ")] })
    );
    const docx = new DocxDocument({ sections: [{ properties: {}, children: paragraphs }] });
    const blob = await Packer.toBlob(docx);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.fullName.replace(/\s+/g, "-")}-cover-letter.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      {/* Left: Form */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h3 className="text-lg font-semibold">Your details</h3>
        <p className="text-muted-foreground text-sm mt-1">Fill in the fields to see a live preview on the right.</p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input value={form.fullName} onChange={update("fullName")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200" placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm font-medium">City</label>
            <input value={form.city} onChange={update("city")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200" placeholder="City, State" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={form.email} onChange={update("email")} type="email" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input value={form.phone} onChange={update("phone")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200" placeholder="(555) 000-0000" />
          </div>
          <div>
            <label className="text-sm font-medium">Company</label>
            <input value={form.company} onChange={update("company")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200" placeholder="Company name" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Company Address</label>
            <textarea value={form.companyAddress} onChange={update("companyAddress")} rows={2} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200" placeholder="Street, City, State" />
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <input value={form.role} onChange={update("role")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200" placeholder="Job title" />
          </div>
          <div>
            <label className="text-sm font-medium">Hiring manager</label>
            <input value={form.hiringManager} onChange={update("hiringManager")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200" placeholder="Name or 'Hiring Manager'" />
          </div>
          <div>
            <label className="text-sm font-medium">Tone</label>
            <select value={form.tone} onChange={update("tone")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200">
              <option value="formal">Formal</option>
              <option value="friendly">Friendly</option>
              <option value="confident">Confident</option>
              <option value="concise">Concise</option>
              <option value="enthusiastic">Enthusiastic</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Template</label>
            <select value={form.template} onChange={update("template")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200">
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="minimalist">Minimalist</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex items-center gap-3 mt-1">
            <input id="referral" type="checkbox" checked={form.referral} onChange={updateCheckbox("referral")} className="h-4 w-4 rounded border-input" />
            <label htmlFor="referral" className="text-sm">I have a referral</label>
          </div>
          {form.referral && (
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Referral name</label>
              <input value={form.referralName} onChange={update("referralName")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200" placeholder="e.g., Taylor Smith" />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Opening</label>
            <textarea value={form.opening} onChange={update("opening")} rows={2} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Highlights (one per line)</label>
            <textarea value={form.highlights} onChange={update("highlights")} rows={4} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Closing</label>
            <textarea value={form.closing} onChange={update("closing")} rows={2} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand transition-all duration-200" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={handleCopy} className="inline-flex items-center justify-center rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all duration-200 transform hover:scale-105 active:scale-95">
            {isCopied ? "Copied!" : "Copy"}
          </button>
          <button onClick={handleDownload} className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3.5 py-2 text-sm font-medium hover:bg-muted transition-all duration-200 transform hover:scale-105 active:scale-95">
            Download .txt
          </button>
          <button onClick={handleDownloadPDF} className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3.5 py-2 text-sm font-medium hover:bg-muted transition-all duration-200 transform hover:scale-105 active:scale-95">
            Download PDF
          </button>
          <button onClick={handleDownloadDOCX} className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3.5 py-2 text-sm font-medium hover:bg-muted transition-all duration-200 transform hover:scale-105 active:scale-95">
            Download .docx
          </button>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="rounded-xl border border-border bg-card p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-lg font-semibold">Preview</h3>
          <span className="text-xs text-muted-foreground">Autosaves as you type</span>
        </div>
        <div className="p-4 sm:p-6 bg-muted/40">
          <article className={`mx-auto w-full ${templateClasses} p-6 sm:p-8 prose prose-neutral max-w-none transition-all duration-300`}>
            {letter.split("\n").map((line, idx) => (
              <p key={idx} className="whitespace-pre-wrap leading-7 text-[15px]">
                {line}
              </p>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
};