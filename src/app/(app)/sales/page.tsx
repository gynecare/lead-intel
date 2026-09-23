import Link from "next/link";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";

const PAYMENT_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-900 text-yellow-200",
  INVOICED: "bg-blue-900 text-blue-200",
  PAID: "bg-green-900 text-green-200",
  OVERDUE: "bg-red-900 text-red-200",
  CANCELLED: "bg-slate-700 text-slate-300",
};

export default async function SalesPage() {
  const sales = await db.leadSale.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      lead: { select: { id: true, companyName: true } },
      buyer: { select: { id: true, companyName: true } },
    },
    take: 200,
  });

  const totalRevenue = sales
    .filter((s) => s.paymentStatus === "PAID")
    .reduce((a, s) => a + Number(s.sellingPrice), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white">Lead Sales</h1>
          <p className="text-slate-400 text-sm mt-1">
            {sales.length} sale{sales.length === 1 ? "" : "s"} ·{" "}
            <span className="text-green-400">
              ${totalRevenue.toLocaleString()} paid
            </span>
          </p>
        </div>
        <Link
          href="/sales/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
        >
          <Plus size={16} />
          Record Sale
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-slate-700 rounded-xl bg-slate-950">
          <p className="text-slate-400">No sales recorded yet.</p>
          <Link
            href="/sales/new"
            className="inline-block mt-3 text-blue-400 hover:text-blue-300 text-sm"
          >
            Record your first sale →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Lead</th>
                <th className="text-left px-4 py-3">Buyer</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-right px-4 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-slate-800 hover:bg-slate-900/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/leads/${s.lead.id}`}
                      className="text-white hover:text-blue-400"
                    >
                      {s.lead.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/buyers/${s.buyer.id}`}
                      className="text-slate-300 hover:text-blue-400"
                    >
                      {s.buyer.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {s.dateSold?.toLocaleDateString() ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${PAYMENT_COLORS[s.paymentStatus]}`}
                    >
                      {s.paymentStatus}
                    </span>
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
  );
}