"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/toast";

export default function EditBuyerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/buyers/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        const b = d.buyer;
        if (!b) return;
        setForm({
          companyName: b.companyName ?? "",
          industry: b.industry ?? "",
          country: b.country ?? "",
          city: b.city ?? "",
          contactName: b.contactName ?? "",
          contactEmail: b.contactEmail ?? "",
          contactPhone: b.contactPhone ?? "",
          productsServices: (b.productsServices ?? []).join(", "),
          wantedLeadTypes: (b.wantedLeadTypes ?? []).join(", "),
          targetLocations: (b.targetLocations ?? []).join(", "),
          preferredQuality: b.preferredQuality ?? "",
          preferredVolume: b.preferredVolume ?? "",
          priceWillingToPay: b.priceWillingToPay
            ? String(b.priceWillingToPay)
            : "",
          feedback: b.feedback ?? "",
          status: b.status ?? "PROSPECT",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  function split(s?: string) {
    return (s ?? "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  async function save() {
    setSaving(true);
    setError(null);

    const payload = {
      companyName: form.companyName,
      industry: form.industry || null,
      country: form.country || null,
      city: form.city || null,
      contactName: form.contactName || null,
      contactEmail: form.contactEmail || null,
      contactPhone: form.contactPhone || null,
      productsServices: split(form.productsServices),
      wantedLeadTypes: split(form.wantedLeadTypes),
      targetLocations: split(form.targetLocations),
      preferredQuality: form.preferredQuality || null,
      preferredVolume: form.preferredVolume || null,
      priceWillingToPay: form.priceWillingToPay
        ? Number(form.priceWillingToPay)
        : null,
      feedback: form.feedback || null,
      status: form.status,
    };

    const res = await fetch(`/api/buyers/${params.id}`, {
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
    toast("Buyer updated");
    router.push(`/buyers/${params.id}`);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this buyer permanently?")) return;
    const res = await fetch(`/api/buyers/${params.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast(body.error ?? "Delete failed", "error");
      return;
    }
    toast("Buyer deleted");
    router.push("/buyers");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-400">
        <div className="animate-pulse">Loading buyer…</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-semibold text-white mb-1">Edit Buyer</h1>
      <p className="text-slate-400 text-sm mb-8">{form.companyName}</p>

      <div className="space-y-6">
        <Section title="Company">
          <Field label="Company Name *">
            <input
              value={form.companyName ?? ""}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
              className="input"
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Industry">
              <input
                value={form.industry ?? ""}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Country (ISO)">
              <input
                maxLength={2}
                value={form.country ?? ""}
                onChange={(e) =>
                  setForm({ ...form, country: e.target.value.toUpperCase() })
                }
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
          </div>
        </Section>

        <Section title="Contact">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Name">
              <input
                value={form.contactName ?? ""}
                onChange={(e) =>
                  setForm({ ...form, contactName: e.target.value })
                }
                className="input"
              />
            </Field>
            <Field label="Email">
              <input
                value={form.contactEmail ?? ""}
                onChange={(e) =>
                  setForm({ ...form, contactEmail: e.target.value })
                }
                className="input"
              />
            </Field>
            <Field label="Phone">
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

        <Section title="Requirements">
          <Field label="Products / Services (comma separated)">
            <input
              value={form.productsServices ?? ""}
              onChange={(e) =>
                setForm({ ...form, productsServices: e.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="Wanted lead types (comma separated)">
            <input
              value={form.wantedLeadTypes ?? ""}
              onChange={(e) =>
                setForm({ ...form, wantedLeadTypes: e.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="Target locations (comma separated)">
            <input
              value={form.targetLocations ?? ""}
              onChange={(e) =>
                setForm({ ...form, targetLocations: e.target.value })
              }
              className="input"
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Preferred Quality">
              <select
                value={form.preferredQuality ?? ""}
                onChange={(e) =>
                  setForm({ ...form, preferredQuality: e.target.value })
                }
                className="input"
              >
                <option value="">— Any —</option>
                <option value="A_PLUS">A+ only</option>
                <option value="A">A or better</option>
                <option value="B">B or better</option>
                <option value="C">C or better</option>
              </select>
            </Field>
            <Field label="Preferred Volume">
              <input
                value={form.preferredVolume ?? ""}
                onChange={(e) =>
                  setForm({ ...form, preferredVolume: e.target.value })
                }
                className="input"
              />
            </Field>
            <Field label="Price Willing to Pay (USD)">
              <input
                type="number"
                value={form.priceWillingToPay ?? ""}
                onChange={(e) =>
                  setForm({ ...form, priceWillingToPay: e.target.value })
                }
                className="input"
              />
            </Field>
          </div>
        </Section>

        <Section title="Status & Notes">
          <Field label="Status">
            <select
              value={form.status ?? "PROSPECT"}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input"
            >
              <option value="PROSPECT">Prospect</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="BLACKLISTED">Blacklisted</option>
            </select>
          </Field>
          <Field label="Feedback / Notes">
            <textarea
              rows={3}
              value={form.feedback ?? ""}
              onChange={(e) => setForm({ ...form, feedback: e.target.value })}
              className="input"
            />
          </Field>
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
            Delete Buyer
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children