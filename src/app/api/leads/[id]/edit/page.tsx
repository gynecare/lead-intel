"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/toast";

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState({
    businessVerified: false,
    emailVerified: false,
    phoneVerified: false,
    requirementVerified: false,
    sourceVerified: false,
  });

  useEffect(() => {
    fetch(`/api/leads/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        const l = d.lead;
        if (!l) return;
        setForm({
          companyName: l.companyName ?? "",
          industry: l.industry ?? "",
          businessType: l.businessType ?? "",
          website: l.website ?? "",
          description: l.description ?? "",
          country: l.country ?? "",
          region: l.region ?? "",
          city: l.city ?? "",
          postalCode: l.postalCode ?? "",
          address: l.address ?? "",
          businessPhone: l.businessPhone ?? "",
          businessEmail: l.businessEmail ?? "",
          companySize: l.companySize ?? "",
          contactName: l.contactName ?? "",
          contactJobTitle: l.contactJobTitle ?? "",
          contactEmail: l.contactEmail ?? "",
          contactPhone: l.contactPhone ?? "",
          potentialRequirement: l.potentialRequirement ?? "",
          productService: l.productService ?? "",
          estimatedValue: l.estimatedValue ? String(l.estimatedValue) : "",
          buyingTimeframe: l.buyingTimeframe ?? "",
          notes: l.notes ?? "",
          inventoryStatus: l.inventoryStatus ?? "NEW",
          qualificationStatus: l.qualificationStatus ?? "UNQUALIFIED",
        });
        setChecks({
          businessVerified: !!l.businessVerified,
          emailVerified: !!l.emailVerified,
          phoneVerified: !!l.phoneVerified,
          requirementVerified: !!l.requirementVerified,
          sourceVerified: !!l.sourceVerified,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  async function save() {
    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = { ...form, ...checks };
    // Cleanup: empty strings to null, estimatedValue to number
    for (const [k, v] of Object.entries(payload)) {
      if (v === "") payload[k] = null;
    }
    if (form.estimatedValue) payload.estimatedValue = Number(form.estimatedValue);

    const res = await fetch(`/api/leads/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Update failed");
      toast("Update failed", "error");
      setSaving(false);
      return;
    }

    toast("Lead updated");
    router.push(`/leads/${params.id}`);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this lead permanently? This cannot be undone.")) return;
    const res = await fetch(`/api/leads/${params.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Delete failed", "error");
      return;
    }
    toast("Lead deleted");
    router.push("/leads");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-400">
        <div className="animate-pulse">Loading lead…</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-semibold text-white mb-1">Edit Lead</h1>
      <p className="text-slate-400 text-sm mb-8">{form.companyName}</p>

      <div className="space-y-6">
        <Section title="Status">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Inventory Status">
              <select
                value={form.inventoryStatus}
                onChange={(e) =>
                  setForm({ ...form, inventoryStatus: e.target.value })
                }
                className="input"
              >
                {[
                  "NEW",
                  "RESEARCHING",
                  "VERIFIED",
                  "QUALIFIED",
                  "AVAILABLE_FOR_SALE",
                  "RESERVED",
                  "SOLD",
                  "DELIVERED",
                  "REJECTED",
                  "DUPLICATE",
                  "EXPIRED",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Qualification Status">
              <select
                value={form.qualificationStatus}
                onChange={(e) =>
                  setForm({ ...form, qualificationStatus: e.target.value })
                }
                className="input"
              >
                {["UNQUALIFIED", "POTENTIAL", "QUALIFIED", "REJECTED"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Business">
          <Field label="Company Name *">
            <input
              value={form.companyName ?? ""}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Industry">
              <input
                value={form.industry ?? ""}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Business Type">
              <input
                value={form.businessType ?? ""}
                onChange={(e) =>
                  setForm({ ...form, businessType: e.target.value })
                }
                className="input"
              />
            </Field>
            <Field label="Website">
              <input
                value={form.website ?? ""}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Company Size">
              <input
                value={form.companySize ?? ""}
                onChange={(e) =>
                  setForm({ ...form, companySize: e.target.value })
                }
                className="input"
              />
            </Field>
          </div>
        </Section>

        <Section title="Location">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Country (ISO)">
              <input
                value={form.country ?? ""}
                maxLength={2}
                onChange={(e) =>
                  setForm({ ...form, country: e.target.value.toUpperCase() })
                }
                className="input"
              />
            </Field>
            <Field label="Region">
              <input
                value={form.region ?? ""}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="City">
              <input
                value={form.city ?? ""}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Postal Code">
              <input
                value={form.postalCode ?? ""}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="input"
              />
            </Field>
          </div>
        </Section>

        <Section title="Contact">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Business Phone">
              <input
                value={form.businessPhone ?? ""}
                onChange={(e) =>
                  setForm({ ...form, businessPhone: e.target.value })
                }
                className="input"
              />
            </Field>
            <Field label="Business Email">
              <input
                value={form.businessEmail ?? ""}
                onChange={(e) =>
                  setForm({ ...form, businessEmail: e.target.value })
                }
                className="input"
              />
            </Field>
            <Field label="Contact Name">
              <input
                value={form.contactName ?? ""}
                onChange={(e) =>
                  setForm({ ...form, contactName: e.target.value })
                }
                className="input"
              />
            </Field>
            <Field label="Contact Job Title">
              <input
                value={form.contactJobTitle ?? ""}
                onChange={(e) =>
                  setForm({ ...form, contactJobTitle: e.target.value })
                }
                className="input"
              />
            </Field>
            <Field label="Contact Email">
              <input
                value={form.contactEmail ?? ""}
                onChange={(e) =>
                  setForm({ ...form, contactEmail: e.target.value })
                }
                className="input"
              />
            </Field>
            <Field label="Contact Phone">
              <input
                value={form.contactPhone ?? ""}
                onChange={(e) =>
                  setForm({ ...form, contactPhone: e.target.value })
                }
                className="input"
              />
            </Field>
          </div>
        </Section>

        <Section title="Opportunity">
          <Field label="Requirement">
            <textarea
              rows={2}
              value={form.potentialRequirement ?? ""}
              onChange={(e) =>
                setForm({ ...form, potentialRequirement: e.target.value })
              }
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product / Service">
              <input
                value={form.productService ?? ""}
                onChange={(e) =>
                  setForm({ ...form, productService: e.target.value })
                }
                className="input"
              />
            </Field>
            <Field label="Estimated Value">
              <input
                type="number"
                value={form.estimatedValue ?? ""}
                onChange={(e) =>
                  setForm({ ...form, estimatedValue: e.target.value })
                }
                className="input"
              />
            </Field>
            <Field label="Buying Timeframe">
              <input
                value={form.buyingTimeframe ?? ""}
                onChange={(e) =>
                  setForm({ ...form, buyingTimeframe: e.target.value })
                }
                className="input"
              />
            </Field>
          </div>
        </Section>

        <Section title="Verification">
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ["businessVerified", "Business"],
                ["emailVerified", "Email"],
                ["phoneVerified", "Phone"],
                ["requirementVerified", "Requirement"],
                ["sourceVerified", "Source"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checks[key]}
                  onChange={(e) =>
                    setChecks({ ...checks, [key]: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                {label}
              </label>
            ))}
          </div>
        </Section>

        <Section title="Notes">
          <textarea
            rows={3}
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="input"
          />
        </Section>

        {error && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={remove}
            className="ml-auto px-5 py-2 rounded-lg border border-red-900 text-red-400 hover:bg-red-950/50"
          >
            Delete Lead
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-slate-800 rounded-xl p-5 bg-slate-950 space-y-4">
      <h2 className="text-white font-medium text-sm uppercase tracking-wide">
        {title}
      </h2>
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