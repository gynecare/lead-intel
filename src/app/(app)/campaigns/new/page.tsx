"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocationPicker } from "@/components/location-picker";

export default function NewCampaignPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [industries, setIndustries] = useState("");
  const [businessTypes, setBusinessTypes] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [requiredProduct, setRequiredProduct] = useState("");
  const [keywords, setKeywords] = useState("");
  const [jobTitles, setJobTitles] = useState("");
  const [requirements, setRequirements] = useState("");
  const [targetCount, setTargetCount] = useState(100);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function split(s: string) {
    return s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        targetCountries: countries,
        targetRegions: regions,
        targetCities: cities,
        targetIndustries: split(industries),
        targetBusinessTypes: split(businessTypes),
        targetCompanySize: companySize || null,
        requiredProduct: requiredProduct || null,
        keywords: split(keywords),
        targetJobTitles: split(jobTitles),
        leadRequirements: requirements || null,
        targetLeadCount: targetCount,
        notes: notes || null,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to create campaign");
      setSaving(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/campaigns/${id}`);
    router.refresh();
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-semibold text-white mb-1">New Campaign</h1>
      <p className="text-slate-400 text-sm mb-8">
        Describe exactly what type of leads you want to find.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="Campaign Name *">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Commercial Solar Leads – California"
            className="input"
          />
        </Field>

        <div className="border border-slate-800 rounded-xl p-5 bg-slate-950">
          <h2 className="text-white font-medium mb-3">Target Market</h2>
          <LocationPicker
            label=""
            countries={countries}
            regions={regions}
            cities={cities}
            onChange={({ countries, regions, cities }) => {
              setCountries(countries);
              setRegions(regions);
              setCities(cities);
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Industries (comma separated)">
            <input
              value={industries}
              onChange={(e) => setIndustries(e.target.value)}
              placeholder="Solar, Construction, Retail"
              className="input"
            />
          </Field>

          <Field label="Business Types">
            <input
              value={businessTypes}
              onChange={(e) => setBusinessTypes(e.target.value)}
              placeholder="B2B, B2C, Manufacturer"
              className="input"
            />
          </Field>

          <Field label="Target Company Size">
            <input
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              placeholder="10-50, 50-200"
              className="input"
            />
          </Field>

          <Field label="Required Product / Service">
            <input
              value={requiredProduct}
              onChange={(e) => setRequiredProduct(e.target.value)}
              placeholder="Solar installation, CRM software"
              className="input"
            />
          </Field>

          <Field label="Keywords">
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="rooftop, energy savings, tax credit"
              className="input"
            />
          </Field>

          <Field label="Target Job Titles">
            <input
              value={jobTitles}
              onChange={(e) => setJobTitles(e.target.value)}
              placeholder="Owner, CFO, Facilities Manager"
              className="input"
            />
          </Field>
        </div>

        <Field label="Lead Requirements">
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={3}
            placeholder="What makes a business a good lead for this campaign?"
            className="input"
          />
        </Field>

        <Field label="Target Lead Count">
          <input
            type="number"
            min={1}
            value={targetCount}
            onChange={(e) => setTargetCount(Number(e.target.value))}
            className="input"
          />
        </Field>

        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="input"
          />
        </Field>

        {error && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium"
          >
            {saving ? "Creating…" : "Create Campaign"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}