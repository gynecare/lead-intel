"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Campaign = { id: string; name: string };

export default function NewLeadPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [campaignId, setCampaignId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [companySize, setCompanySize] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactJobTitle, setContactJobTitle] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [potentialRequirement, setPotentialRequirement] = useState("");
  const [productService, setProductService] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [buyingTimeframe, setBuyingTimeframe] = useState("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState("manual");
  const [sourceUrl, setSourceUrl] = useState("");

  // Verification
  const [businessVerified, setBusinessVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [requirementVerified, setRequirementVerified] = useState(false);
  const [sourceVerified, setSourceVerified] = useState(false);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((d) => setCampaigns(d.campaigns ?? []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: campaignId || null,
        companyName,
        industry: industry || null,
        businessType: businessType || null,
        website: website || null,
        description: description || null,
        country: country || null,
        region: region || null,
        city: city || null,
        postalCode: postalCode || null,
        address: address || null,
        businessPhone: businessPhone || null,
        businessEmail: businessEmail || null,
        companySize: companySize || null,
        contactName: contactName || null,
        contactJobTitle: contactJobTitle || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        potentialRequirement: potentialRequirement || null,
        productService: productService || null,
        estimatedValue: estimatedValue ? Number(estimatedValue) : null,
        buyingTimeframe: buyingTimeframe || null,
        notes: notes || null,
        source,
        sourceUrl: sourceUrl || null,
        businessVerified,
        emailVerified,
        phoneVerified,
        requirementVerified,
        sourceVerified,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setError(
          `Duplicate: ${body.companyName} already exists (ID: ${body.existingId})`
        );
      } else {
        setError(body.error ?? "Failed to create lead");
      }
      setSaving(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/leads/${id}`);
    router.refresh();
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-semibold text-white mb-1">Add Lead</h1>
      <p className="text-slate-400 text-sm mb-8">
        Only use legitimate public business information.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Business Information">
          <Field label="Company Name *">
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Industry">
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Business Type">
              <input
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Website">
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://…"
                className="input"
              />
            </Field>
            <Field label="Company Size">
              <input
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                placeholder="10-50"
                className="input"
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
            />
          </Field>
        </Section>

        <Section title="Location">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Country (ISO code, e.g. US)">
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                maxLength={2}
                className="input"
              />
            </Field>
            <Field label="Region / State">
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="City">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Postal / ZIP">
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <Field label="Street Address">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Business Phone">
              <input
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Business Email">
              <input
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                className="input"
              />
            </Field>
          </div>
        </Section>

        <Section title="Contact Person (business contact only)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name">
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Job Title">
              <input
                value={contactJobTitle}
                onChange={(e) => setContactJobTitle(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Phone">
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="input"
              />
            </Field>
          </div>
        </Section>

        <Section title="Opportunity">
          <Field label="Potential Requirement">
            <textarea
              rows={2}
              value={potentialRequirement}
              onChange={(e) => setPotentialRequirement(e.target.value)}
              placeholder="e.g. Looking to install rooftop solar in 2026"
              className="input"
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product / Service">
              <input
                value={productService}
                onChange={(e) => setProductService(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Estimated Value (USD)">
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Buying Timeframe">
              <input
                value={buyingTimeframe}
                onChange={(e) => setBuyingTimeframe(e.target.value)}
                placeholder="e.g. 3-6 months"
                className="input"
              />
            </Field>
            <Field label="Link to Campaign">
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="input"
              >
                <option value="">— None —</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Source & Verification">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Source">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="input"
              >
                <option value="manual">Manual entry</option>
                <option value="referral">Referral</option>
                <option value="csv_import">CSV import</option>
                <option value="public_website">Public company website</option>
                <option value="directory">Business directory</option>
                <option value="inquiry_form">Website inquiry form</option>
                <option value="api">Approved API</option>
              </select>
            </Field>
            <Field label="Source URL">
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://…"
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            <Checkbox label="Business verified" checked={businessVerified} onChange={setBusinessVerified} />
            <Checkbox label="Email verified" checked={emailVerified} onChange={setEmailVerified} />
            <Checkbox label="Phone verified" checked={phoneVerified} onChange={setPhoneVerified} />
            <Checkbox label="Requirement verified" checked={requirementVerified} onChange={setRequirementVerified} />
            <Checkbox label="Source verified" checked={sourceVerified} onChange={setSourceVerified} />
          </div>
        </Section>

        <Field label="Notes">
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            {saving ? "Saving…" : "Save Lead"}
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-800 rounded-xl p-5 bg-slate-950 space-y-4">
      <h2 className="text-white font-medium text-sm uppercase tracking-wide">
        {title}
      </h2>
      {children}
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

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-600 bg-slate-800"
      />
      {label}
    </label>
  );
}