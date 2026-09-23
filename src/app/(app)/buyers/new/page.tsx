"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBuyerPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [productsServices, setProductsServices] = useState("");
  const [wantedLeadTypes, setWantedLeadTypes] = useState("");
  const [targetLocations, setTargetLocations] = useState("");
  const [preferredQuality, setPreferredQuality] = useState("");
  const [preferredVolume, setPreferredVolume] = useState("");
  const [priceWillingToPay, setPriceWillingToPay] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("PROSPECT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function split(s: string) {
    return s.split(",").map((x) => x.trim()).filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/buyers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        industry: industry || null,
        country: country || null,
        city: city || null,
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        productsServices: split(productsServices),
        wantedLeadTypes: split(wantedLeadTypes),
        targetLocations: split(targetLocations),
        preferredQuality: preferredQuality || null,
        preferredVolume: preferredVolume || null,
        priceWillingToPay: priceWillingToPay ? Number(priceWillingToPay) : null,
        feedback: feedback || null,
        status,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to create buyer");
      setSaving(false);
      return;
    }
    const { id } = await res.json();
    router.push(`/buyers/${id}`);
    router.refresh();
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-semibold text-white mb-1">New Buyer</h1>
      <p className="text-slate-400 text-sm mb-8">
        A company that purchases qualified leads from you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Company">
          <Field label="Company Name *">
            <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input" />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Industry">
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} className="input" />
            </Field>
            <Field label="Country (ISO)">
              <input value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())} maxLength={2} className="input" />
            </Field>
            <Field label="City">
              <input value={city} onChange={(e) => setCity(e.target.value)} className="input" />
            </Field>
          </div>
        </Section>

        <Section title="Contact">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Name">
              <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="input" />
            </Field>
            <Field label="Email">
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="input" />
            </Field>
            <Field label="Phone">
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="input" />
            </Field>
          </div>
        </Section>

        <Section title="Requirements">
          <Field label="Products / Services they sell (comma separated)">
            <input value={productsServices} onChange={(e) => setProductsServices(e.target.value)} placeholder="Solar installation, Battery storage" className="input" />
          </Field>
          <Field label="Wanted lead types (comma separated)">
            <input value={wantedLeadTypes} onChange={(e) => setWantedLeadTypes(e.target.value)} placeholder="Commercial solar, Residential solar" className="input" />
          </Field>
          <Field label="Target locations (comma separated)">
            <input value={targetLocations} onChange={(e) => setTargetLocations(e.target.value)} placeholder="California, Texas" className="input" />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Preferred Quality">
              <select value={preferredQuality} onChange={(e) => setPreferredQuality(e.target.value)} className="input">
                <option value="">— Any —</option>
                <option value="A_PLUS">A+ only</option>
                <option value="A">A or better</option>
                <option value="B">B or better</option>
                <option value="C">C or better</option>
              </select>
            </Field>
            <Field label="Preferred Volume">
              <input value={preferredVolume} onChange={(e) => setPreferredVolume(e.target.value)} placeholder="10-50 per month" className="input" />
            </Field>
            <Field label="Price willing to pay (USD)">
              <input type="number" value={priceWillingToPay} onChange={(e) => setPriceWillingToPay(e.target.value)} className="input" />
            </Field>
          </div>
        </Section>

        <Section title="Status & Notes">
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              <option value="PROSPECT">Prospect</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="BLACKLISTED">Blacklisted</option>
            </select>
          </Field>
          <Field label="Feedback / Notes">
            <textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} className="input" />
          </Field>
        </Section>

        {error && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium">
            {saving ? "Saving…" : "Save Buyer"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-slate-800 rounded-xl p-5 bg-slate-950 space-y-4">
      <h2 className="text-white font-medium text-sm uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}