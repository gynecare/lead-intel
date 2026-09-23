"use client";

import { useEffect, useRef, useState } from "react";

type Campaign = { id: string; name: string };

export default function ExportsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // ── Import state ──
  const [file, setFile] = useState<File | null>(null);
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

  // ── Export state ──
  const [exportCampaign, setExportCampaign] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [exportScore, setExportScore] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((d) => setCampaigns(d.campaigns ?? []))
      .catch(() => {});
  }, []);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setImporting(true);
    setImportError(null);
    setImportResult(null);

    const form = new FormData();
    form.append("file", file);
    if (importCampaign) form.append("campaignId", importCampaign);

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
    setFile(null);
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
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-semibold text-white mb-1">Import / Export</h1>
      <p className="text-slate-400 text-sm mb-8">
        Bulk upload leads from CSV or export your inventory
      </p>

      {/* ═══ IMPORT ═══ */}
      <section className="rounded-xl border border-slate-800 bg-slate-950 p-6 mb-8">
        <h2 className="text-white font-medium mb-1">Import Leads from CSV</h2>
        <p className="text-xs text-slate-500 mb-5">
          First time?{" "}
          <a
            href="/api/import/template"
            className="text-blue-400 hover:text-blue-300"
          >
            Download the CSV template →
          </a>
        </p>

        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">
              CSV file
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">
              Link to campaign (optional)
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

          <button
            type="submit"
            disabled={!file || importing}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium"
          >
            {importing ? "Importing…" : "Import"}
          </button>
        </form>

        {importError && (
          <div className="mt-5 text-sm text-red-400 bg-red-950/40 border border-red-900 px-3 py-2 rounded-lg">
            {importError}
          </div>
        )}

        {importResult && (
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <Stat label="Rows" value={importResult.total} />
              <Stat label="Created" value={importResult.created} accent="green" />
              <Stat
                label="Duplicates"
                value={importResult.duplicates}
                accent="yellow"
              />
              <Stat label="Errors" value={importResult.errors} accent="red" />
            </div>

            {importResult.errorDetails.length > 0 && (
              <details className="text-xs text-slate-400 bg-slate-900 rounded-lg p-3">
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
          </div>
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
              <label className="block text-sm text-slate-300 mb-1.5">
                Campaign
              </label>
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
              <label className="block text-sm text-slate-300 mb-1.5">
                Status
              </label>
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
              <label className="block text-sm text-slate-300 mb-1.5">
                Score
              </label>
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
              type="button"
              onClick={() => handleExport()}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
            >
              Export CSV
            </button>
            <button
              type="button"
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