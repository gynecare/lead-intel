import Link from "next/link";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";

const SCORE_COLORS: Record<string, string> = {
  A_PLUS: "bg-emerald-500/20 text-emerald-300 border-emerald-700",
  A: "bg-green-500/20 text-green-300 border-green-700",
  B: "bg-yellow-500/20 text-yellow-300 border-yellow-700",
  C: "bg-orange-500/20 text-orange-300 border-orange-700",
  D: "bg-red-500/20 text-red-300 border-red-700",
  UNRATED: "bg-slate-500/20 text-slate-300 border-slate-700",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-slate-700 text-slate-200",
  RESEARCHING: "bg-blue-900 text-blue-200",
  VERIFIED: "bg-cyan-900 text-cyan-200",
  QUALIFIED: "bg-green-900 text-green-200",
  AVAILABLE_FOR_SALE: "bg-emerald-900 text-emerald-200",
  RESERVED: "bg-yellow-900 text-yellow-200",
  SOLD: "bg-purple-900 text-purple-200",
  DELIVERED: "bg-indigo-900 text-indigo-200",
  REJECTED: "bg-red-900 text-red-200",
  DUPLICATE: "bg-slate-800 text-slate-400",
  EXPIRED: "bg-slate-800 text-slate-400",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: string; status?: string; score?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const country = sp.country ?? "";
  const status = sp.status ?? "";
  const score = sp.score ?? "";

  const leads = await db.lead.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { companyName: { contains: q, mode: "insensitive" } },
                { industry: { contains: q, mode: "insensitive" } },
                { city: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        country ? { country } : {},
        status ? { inventoryStatus: status as any } : {},
        score ? { leadScore: score as any } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { campaign: { select: { name: true } } },
    take: 200,
  });

  const total = await db.lead.count();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white">Lead Inventory</h1>
          <p className="text-slate-400 text-sm mt-1">
            {total} lead{total === 1 ? "" : "s"} total
          </p>
        </div>
        <Link
          href="/leads/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
        >
          <Plus size={16} />
          Add Lead
        </Link>
      </div>

      <form method="GET" className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search company, industry, city…"
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:border-blue-500 focus:outline-none text-sm"
        />
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm"
        >
          <option value="">All statuses</option>
          {Object.keys(STATUS_COLORS).map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          name="score"
          defaultValue={score}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm"
        >
          <option value="">All scores</option>
          {Object.keys(SCORE_COLORS).map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, "+")}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm"
        >
          Filter
        </button>
      </form>

      {leads.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-slate-700 rounded-xl bg-slate-950">
          <p className="text-slate-400">
            {total === 0 ? "No leads yet." : "No leads match your filters."}
          </p>
          {total === 0 && (
            <Link
              href="/leads/new"
              className="inline-block mt-3 text-blue-400 hover:text-blue-300 text-sm"
            >
              Add your first lead →
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Industry</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Est. Value</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr
                  key={l.id}
                  className="border-t border-slate-800 hover:bg-slate-900/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/leads/${l.id}`}
                      className="text-white hover:text-blue-400 font-medium"
                    >
                      {l.companyName}
                    </Link>
                    {l.campaign && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        {l.campaign.name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {l.industry ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {[l.city, l.region, l.country].filter(Boolean).join(", ") ||
                      "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${SCORE_COLORS[l.leadScore]}`}
                    >
                      {l.leadScore.replace("_PLUS", "+").replace("_", "")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[l.inventoryStatus]}`}
                    >
                      {l.inventoryStatus.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {l.estimatedValue
                      ? `$${Number(l.estimatedValue).toLocaleString()}`
                      : "—"}
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