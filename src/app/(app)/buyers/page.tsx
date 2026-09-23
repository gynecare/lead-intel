import Link from "next/link";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-900 text-green-200",
  PAUSED: "bg-yellow-900 text-yellow-200",
  BLACKLISTED: "bg-red-900 text-red-200",
  PROSPECT: "bg-blue-900 text-blue-200",
};

export default async function BuyersPage() {
  const buyers = await db.buyer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sales: true } } },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white">Buyers</h1>
          <p className="text-slate-400 text-sm mt-1">
            Companies that purchase leads from you
          </p>
        </div>
        <Link
          href="/buyers/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
        >
          <Plus size={16} />
          New Buyer
        </Link>
      </div>

      {buyers.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-slate-700 rounded-xl bg-slate-950">
          <p className="text-slate-400">No buyers yet.</p>
          <Link
            href="/buyers/new"
            className="inline-block mt-3 text-blue-400 hover:text-blue-300 text-sm"
          >
            Add your first buyer →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Industry</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Purchases</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((b) => (
                <tr
                  key={b.id}
                  className="border-t border-slate-800 hover:bg-slate-900/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/buyers/${b.id}`}
                      className="text-white hover:text-blue-400 font-medium"
                    >
                      {b.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {b.industry ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {[b.city, b.country].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {b._count.sales}
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