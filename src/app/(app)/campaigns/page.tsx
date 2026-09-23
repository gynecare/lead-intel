import Link from "next/link";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";

export default async function CampaignsPage() {
  const campaigns = await db.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { leads: true } } },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white">Campaigns</h1>
          <p className="text-slate-400 text-sm mt-1">
            Define what types of leads to find
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
        >
          <Plus size={16} />
          New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-slate-700 rounded-xl bg-slate-950">
          <p className="text-slate-400">No campaigns yet.</p>
          <Link
            href="/campaigns/new"
            className="inline-block mt-3 text-blue-400 hover:text-blue-300 text-sm"
          >
            Create your first campaign →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Countries</th>
                <th className="text-right px-4 py-3">Leads</th>
                <th className="text-right px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-slate-800 hover:bg-slate-900/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/campaigns/${c.id}`}
                      className="text-white hover:text-blue-400 font-medium"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {c.targetCountries.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {c._count.leads}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 text-xs">
                    {c.createdAt.toLocaleDateString()}
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