import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

const SCORE_COLORS: Record<string, string> = {
  A_PLUS: "bg-emerald-500/20 text-emerald-300 border-emerald-700",
  A: "bg-green-500/20 text-green-300 border-green-700",
  B: "bg-yellow-500/20 text-yellow-300 border-yellow-700",
  C: "bg-orange-500/20 text-orange-300 border-orange-700",
  D: "bg-red-500/20 text-red-300 border-red-700",
  UNRATED: "bg-slate-500/20 text-slate-300 border-slate-700",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lead = await db.lead.findUnique({
    where: { id },
    include: { campaign: true },
  });

  if (!lead) notFound();

  const breakdown = (lead.scoreBreakdown as Record<string, number>) ?? {};

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <Link href="/leads" className="text-sm text-slate-400 hover:text-white">
          ← Back to leads
        </Link>
        <Link
          href={`/leads/${lead.id}/edit`}
          className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm"
        >
          Edit
        </Link>
      </div>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            {lead.companyName}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {[lead.industry, lead.businessType].filter(Boolean).join(" · ") ||
              "—"}
          </p>
          {lead.campaign && (
            <p className="text-xs text-slate-500 mt-1">
              Campaign:{" "}
              <Link
                href={`/campaigns/${lead.campaign.id}`}
                className="text-blue-400 hover:text-blue-300"
              >
                {lead.campaign.name}
              </Link>
            </p>
          )}
        </div>
        <div className="text-right">
          <span
            className={`text-xs px-3 py-1 rounded border ${SCORE_COLORS[lead.leadScore]}`}
          >
            {lead.leadScore.replace("_PLUS", "+").replace("_", "")}
          </span>
          <div className="text-xs text-slate-500 mt-2">
            {Object.values(breakdown).reduce((a, b) => a + b, 0)}/100
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Business Info">
          <KV label="Website" value={lead.website} />
          <KV label="Description" value={lead.description} />
          <KV label="Company Size" value={lead.companySize} />
          <KV label="Business Phone" value={lead.businessPhone} />
          <KV label="Business Email" value={lead.businessEmail} />
        </Card>

        <Card title="Location">
          <KV
            label="Address"
            value={[lead.address, lead.city, lead.region, lead.postalCode, lead.country]
              .filter(Boolean)
              .join(", ")}
          />
        </Card>

        <Card title="Contact">
          <KV label="Name" value={lead.contactName} />
          <KV label="Title" value={lead.contactJobTitle} />
          <KV label="Email" value={lead.contactEmail} />
          <KV label="Phone" value={lead.contactPhone} />
        </Card>

        <Card title="Opportunity">
          <KV label="Requirement" value={lead.potentialRequirement} />
          <KV label="Product" value={lead.productService} />
          <KV
            label="Est. Value"
            value={
              lead.estimatedValue
                ? `$${Number(lead.estimatedValue).toLocaleString()} ${lead.estimatedValueCurrency}`
                : null
            }
          />
          <KV label="Timeframe" value={lead.buyingTimeframe} />
        </Card>

        <Card title="Verification">
          <Verify label="Business" ok={lead.businessVerified} />
          <Verify label="Contact" ok={lead.contactVerified} />
          <Verify label="Email" ok={lead.emailVerified} />
          <Verify label="Phone" ok={lead.phoneVerified} />
          <Verify label="Requirement" ok={lead.requirementVerified} />
          <Verify label="Source" ok={lead.sourceVerified} />
        </Card>

        <Card title="Source">
          <KV label="Type" value={lead.source} />
          <KV label="URL" value={lead.sourceUrl} />
          <KV
            label="Collected"
            value={
              lead.sourceCollectedAt
                ? lead.sourceCollectedAt.toLocaleDateString()
                : null
            }
          />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Score Breakdown">
          {Object.entries(breakdown).map(([k, v]) => (
            <div key={k} className="flex text-sm">
              <span className="w-40 text-slate-500 capitalize">
                {k.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <span className="text-slate-200">{v} pts</span>
            </div>
          ))}
        </Card>

        <Card title="Notes">
          <p className="text-sm text-slate-300 whitespace-pre-wrap">
            {lead.notes || "—"}
          </p>
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
      <span className="w-28 text-slate-500">{label}</span>
      <span className="text-slate-200 flex-1 break-words">{value}</span>
    </div>
  );
}

function Verify({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <CheckCircle2 size={14} className="text-emerald-400" />
      ) : (
        <XCircle size={14} className="text-slate-600" />
      )}
      <span className={ok ? "text-slate-200" : "text-slate-500"}>{label}</span>
    </div>
  );
}