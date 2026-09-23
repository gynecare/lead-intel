"use client";

import { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import { DB_FIELDS, autoMapHeaders, type DbField } from "@/lib/column-mapper";

type Campaign = { id: string; name: string };

type Step = "upload" | "map" | "imported";

export default function ExportsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Import wizard
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, DbField>>({});
  const [importCampaign, setImportCampaign] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    total: number;
    created: number;
    duplicates: number;
    errors: number;
    errorDetails: string[];
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export state
  const [exportCampaign, setExportCampaign] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [exportScore, setExportScore] = useState("");

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((d) => setCampaigns(d.campaigns ?? []))
      .catch(() => {});
  }, []);

  async function handleFileSelected(f: File) {
    setFile(f);
    setImportError(null);

    const text = await f.text();
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      preview: 6,
    });

    if (parsed.errors.length > 0) {
      setImportError(parsed.errors[0].message);
      return;
    }

    const headers = parsed.meta.fields ?? [];
    if (headers.length === 0) {
      setImportError("Could not detect columns in CSV");
      return;
    }

    setCsvHeaders(headers);
    setPreviewRows(parsed.data.slice(0, 5));
    setMapping(autoMapHeaders(headers));
    setStep("map");
  }

  async function handleImport() {
    if (!file) return;
    const companyFieldAssigned = Object.values(mapping).includes("companyName");
    if (!companyFieldAssigned) {
      setImportError("Please map at least one column to Company Name");
      return;
    }

    setImporting(true);
    setImportError(null);

    const form = new FormData();
    form.append("file", file);
    if (importCampaign) form.append("campaignId", importCampaign);
    form.append("mapping", JSON.stringify(mapping));

    const res = await fetch("/api/import", { method: "POST", body: form });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setImportError(body.error ?? "Import failed");
      setImporting(false);
      return;
    }

    const result = await res.json();
    setImportResult(result);
    setImporting(false);
    setStep("imported");
  }

  function resetWizard() {
    setStep("upload");
    setFile(null);
    setCsvHeaders([]);
    setPreviewRows([]);
    setMapping({});
    setImportResult(null);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleExport(template?: string) {
    const params = new URLSearchParams();
    if (exportCampaign) params.set("campaignId", exportCampaign);
    if (exportStatus) params.set("status", exportStatus);
    if (exportScore) params.set("score", exportScore);
    if (template) params.set("template", template);
    window.location.href = `/api/export?${params.toString()}`;
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-3xl font-semibold text-white mb-1">Import / Export</h1>
      <p className="text-slate-400 text-sm mb-8">
        Bulk upload leads from any CSV (Google Maps, Apollo, directories) or export
      </p>

      {/* ═══ IMPORT WIZARD ═══ */}
      <section className="rounded-xl border border-slate-800 bg-slate-950 p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-medium">Import Leads</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <StepDot active={step === "upload"} done={step !== "upload"} label="1. Upload" />
            <span>→</span>
            <StepDot active={step === "map"} done={step === "imported"} label="2. Map columns" />
            <span>→</span>
            <StepDot active={step === "imported"} done={false} label="3. Done" />
          </div>
        </div>

        {/* STEP 1 — Upload */}
        {step === "upload" && (
          <>
            <p className="text-xs text-slate-500 mb-5">
              Works with any CSV — Google Maps scrapers, Apollo exports, directories.{" "}
              <a href="/api/import/template" className="text-blue-400 hover:text-blue-300">
                Or download our template →
              </a>
            </p>

            <label className="block">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelected(f);
                }}
                className="hidden"
              />
              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-10 text-center cursor-pointer transition">
                <div className="text-slate-300 text-sm font-medium mb-1">
                  Click to select a CSV file
                </div>
                <div className="text-xs text-slate-500">
                  We'll auto-detect the column names on the next step
                </div>
              </div>
            </label>

            {importError && (
              <div className="mt-5 text-sm text-red-400 bg-red-950/40 border border-red-900 px-3 py-2 rounded-lg">
                {importError}
              </div>
            )}
          </>
        )}

        {/* STEP 2 — Map columns */}
        {step === "map" && (
          <>
            <div className="mb-4 text-xs text-slate-400">
              File: <span className="text-slate-200">{file?.name}</span> ·{" "}
              {csvHeaders.length} column{csvHeaders.length === 1 ? "" : "s"} detected
            </div>

            <div className="space-y-3">
              {csvHeaders.map((header) => (
                <div
                  key={header}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800"
                >
                  <div className="w-1/3 text-sm text-slate-300 truncate" title={header}>
                    {header}
                  </div>
                  <div className="text-slate-600">→</div>
                  <select
                    value={mapping[header] ?? "skip"}
                    onChange={(e) =>
                      setMapping({ ...mapping, [header]: e.target.value as DbField })
                    }
                    className="flex-1 px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {DB_FIELDS.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.label}
                        {f.required ? " *" : ""}
                      </option>
                    ))}
                  </select>
                  {previewRows[0]?.[header] && (
                    <div
                      className="w-1/4 text-xs text-slate-500 truncate"
                      title={previewRows[0][header]}
                    >
                      e.g. {previewRows[0][header]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label className="block text-sm text-slate-300 mb-1.5">
                Link imported leads to a campaign (optional)
              </label>
              <select
                value={importCampaign}
                onChange={(e) => setImportCampaign(e.target.value)}
                className="input"
              >
                <option value="">— None —</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {importError && (
              <div className="mt-5 text-sm text-red-400 bg-red-950/40 border border-red-900 px-3 py-2 rounded-lg">
                {importError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium"
              >
                {importing ? "Importing…" : "Import Leads"}
              </button>
              <button
                onClick={resetWizard}
                className="px-5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* STEP 3 — Result */}
        {step === "imported" && importResult && (
          <>
            <div className="grid grid-cols-4 gap-3 mb-5">
              <Stat label="Rows" value={importResult.total} />
              <Stat label="Created" value={importResult.created} accent="green" />
              <Stat label="Duplicates" value={importResult.duplicates} accent="yellow" />
              <Stat label="Errors" value={importResult.errors} accent="red" />
            </div>

            {importResult.errorDetails.length > 0 && (
              <details className="text-xs text-slate-400 bg-slate-900 rounded-lg p-3 mb-5">
                <summary className="cursor-pointer text-slate-300">
                  Details ({importResult.errorDetails.length})
                </summary>
                <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                  {importResult.errorDetails.map((msg, i) => (
                    <li key={i} className="text-slate-500">
                      {msg}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={resetWizard}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
              >
                Import Another File
              </button>
              <a
                href="/leads"
                className="px-5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                View Leads →
              </a>
            </div>
          </>
        )}
      </section>

      {/* ═══ EXPORT ═══ */}
      <section className="rounded-xl border border-slate-800 bg-slate-950 p-6">
        <h2 className="text-white font-medium mb-1">Export Leads</h2>
        <p className="text-xs text-slate-500 mb-5">
          Downloads as CSV. Filter first if you only want a subset.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Campaign</label>
              <select
                value={exportCampaign}
                onChange={(e) => setExportCampaign(e.target.value)}
                className="input"
              >
                <option value="">All campaigns</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Status</label>
              <select
                value={exportStatus}
                onChange={(e) => setExportStatus(e.target.value)}
                className="input"
              >
                <option value="">All</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="AVAILABLE_FOR_SALE">Available for Sale</option>
                <option value="SOLD">Sold</option>
                <option value="NEW">New</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Score</label>
              <select
                value={exportScore}
                onChange={(e) => setExportScore(e.target.value)}
                className="input"
              >
                <option value="">All</option>
                <option value="A_PLUS">A+</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleExport()}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport("delivery")}
              className="px-5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Export "Delivery Template"
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <span
      className={`px-2 py-0.5 rounded ${
        active
          ? "bg-blue-600 text-white"
          : done
          ? "bg-green-900/50 text-green-300"
          : "text-slate-500"
      }`}
    >
      {label}
    </span>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "green" | "yellow" | "red";
}) {
  const color =
    accent === "green"
      ? "text-green-400"
      : accent === "yellow"
      ? "text-yellow-400"
      : accent === "red"
      ? "text-red-400"
      : "text-white";
  return (
    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className={`text-xl font-semibold mt-1 ${color}`}>{value}</div>
    </div>
  );
}