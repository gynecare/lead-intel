import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function BuyerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const buyer = await db.buyer.findUnique({
    where: { id },
    include: { sales: { include: { lead: { select: { companyName: true } } } } },
  });

  if (!buyer) notFound();

  const totalPaid = buyer.sales
    .filter((s) => s.paymentStatus === "PAID")
    .reduce((a, s) => a + Number(s.sellingPrice), 0);

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/buyers" className="text-sm text-slate-400 hover:text-white">
        ← Back to buyers
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            {buyer.companyName}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {[buyer.industry, buyer.city, buyer.country]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase text-slate-500">Total Paid</div>
          <div className="text-2xl text-white">
            ${totalPaid.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Contact">
          <KV label="Name" value={buyer.contactName} />
          <KV label="Email" value={buyer.contactEmail} />
          <KV label="Phone" value={buyer.contactPhone} />
        </Card>

        <Card title="Preferences">
          <KV label="Quality" value={buyer.preferredQuality} />
          <KV label="Volume" value={buyer.preferredVolume} />
          <KV
            label="Price"
            value={
              buyer.priceWillingToPay
                ? `$${Number(buyer.priceWillingToPay).toLocaleString()} ${buyer.priceCurrency}`
                : null
            }
          />
          <KV label="Status" value={buyer.status} />
        </Card>

        <Card title="Products / Services">
          <Tags items={buyer.productsServices} />
        </Card>

        <Card title="Wants Lead Types">
          <Tags items={buyer.wantedLeadTypes} />
        </Card>

        <Card title="Target Locations">
          <Tags items={buyer.targetLocations} />
        </Card>

        <Card title="Feedback">
          <p className="text-sm text-slate-300 whitespace-pre-wrap">
            {buyer.feedback || "—"}
          </p>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-white font-medium mb-3 text-sm uppercase tracking-wide">
          Purchase History ({buyer.sales.length})
        </h2>
        {buyer.sales.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-700 rounded-xl bg-slate-950 text-sm text-slate-500">
            No purchases yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Lead</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Payment</th>
                  <th className="text-right px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {buyer.sales.map((s) => (
                  <tr key={s.id} className="border-t border-slate-800">
                    <td className="px-4 py-3">
                      <Link
                        href={`/leads/${s.leadId}`}
                        className="text-white hover:text-blue-400"
                      >
                        {s.lead.companyName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {s.dateSold?.toLocaleDateString() ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {s.paymentStatus}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-200">
                      ${Number(s.sellingPrice).toLocaleString()} {s.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <h2 className="text-white font-medium mb-3 text-sm uppercase tracking-wide">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function KV({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex text-sm">
      <span className="w-24 text-slate-500">{label}</span>
      <span className="text-slate-200 flex-1 break-words">{value}</span>
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  if (!items || items.length === 0)
    return <p className="text-sm text-slate-500">—</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span
          key={t}
          className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300"
        >
          {t}
        </span>
      ))}
    </div>
  );
}