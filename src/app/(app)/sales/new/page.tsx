"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; companyName: string };

export default function NewSalePage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Option[]>([]);
  const [buyers, setBuyers] = useState<Option[]>([]);

  const [leadId, setLeadId] = useState("");
  const [buyerId, setBuyerId] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [dateSold, setDateSold] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [deliveryStatus, setDeliveryStatus] = useState("NOT_DELIVERED");
  const [exclusivity, setExclusivity] = useState("UNSPECIFIED");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) =>
        setLeads(
          (d.leads ?? []).map((l: { id: string; companyName: string }) => ({
            id: l.id,
            companyName: l.companyName,
          }))
        )
      )
      .catch(() => {});
    fetch("/api/buyers")
      .then((r) => r.json())
      .then((d) => setBuyers(d.buyers ?? []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId,
        buyerId,
        sellingPrice: Number(sellingPrice),
        currency,
        dateSold,
        paymentStatus,
        deliveryStatus,
        exclusivity,
        notes: notes || null,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to record sale");
      setSaving(false);
      return;
    }

    router.push("/sales");
    router.refresh();
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-semibold text-white mb-1">Record Sale</h1>
      <p className="text-slate-400 text-sm mb-8">
        Log a lead you sold to a buyer.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Lead *">
          <select
            required
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className="input"
          >
            <option value="">— Select lead —</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.companyName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Buyer *">
          <select
            required
            value={buyerId}
            onChange={(e) => setBuyerId(e.target.value)}
            className="input"
          >
            <option value="">— Select buyer —</option>
            {buyers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.companyName}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Selling Price *">
            <input
              required
              type="number"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Currency">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="PKR">PKR</option>
              <option value="AED">AED</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </Field>
        </div>

        <Field label="Date Sold">
          <input
            type="date"
            value={dateSold}
            onChange={(e) => setDateSold(e.target.value)}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Payment Status">
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="input"
            >
              <option value="PENDING">Pending</option>
              <option value="INVOICED">Invoiced</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </Field>
          <Field label="Delivery Status">
            <select
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value)}
              className="input"
            >
              <option value="NOT_DELIVERED">Not delivered</option>
              <option value="DELIVERED">Delivered</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
            </select>
          </Field>
        </div>

        <Field label="Exclusivity">
          <select
            value={exclusivity}
            onChange={(e) => setExclusivity(e.target.value)}
            className="input"
          >
            <option value="UNSPECIFIED">— Not specified —</option>
            <option value="EXCLUSIVE">Exclusive (sold to only this buyer)</option>
            <option value="NON_EXCLUSIVE">Non-exclusive</option>
          </select>
        </Field>

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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium"
          >
            {saving ? "Saving…" : "Record Sale"}
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