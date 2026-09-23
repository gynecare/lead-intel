import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const campaign = await db.campaign.findUnique({
    where: { id },
    include: { _count: { select: { leads: true } } },
  });

  if (!campaign) notFound();

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/campaigns"
        className="text-sm text-slate-400 hover:text-white"
      >
        ← Back to campaigns
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            {campaign.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {campaign.status} · Created{" "}
            {campaign.createdAt.toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase text-slate-500">Leads</div>
          <div className="text-2xl text-white">{campaign._count.leads}</div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Target Locations">
          <KV label="Countries" value={campaign.targetCountries.join(", ")} />
          <KV label="Regions" value={campaign.targetRegions.join(", ")} />
          <KV label="Cities" value={campaign.targetCities.join(", ")} />
        </Card>

        <Card title="Business Profile">
          <KV label="Industries" value={campaign.targetIndustries.join(", ")} />
          <KV
            label="Business Types"
            value={campaign.targetBusinessTypes.join(", ")}
          />
          <KV label="Company Size" value={campaign.targetCompanySize ?? ""} />
          <KV
            label="Required Product"
            value={campaign.requiredProduct ?? ""}
          />
        </Card>

        <Card title="Lead Criteria">
          <KV label="Keywords" value={campaign.keywords.join(", ")} />
          <KV label="Job Titles" value={campaign.targetJobTitles.join(", ")} />
          <KV
            label="Target Count"
            value={String(campaign.targetLeadCount)}
          />
        </Card>

        <Card title="Notes">
          <p className="text-sm text-slate-300 whitespace-pre-wrap">
            {campaign.notes || "—"}
          </p>
        </Card>
      </div>

      <div className="mt-8">
        <Card title="Lead Requirements">
          <p className="text-sm text-slate-300 whitespace-pre-wrap">
            {campaign.leadRequirements || "—"}
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

function KV({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex text-sm">
      <span className="w-32 text-slate-500">{label}</span>
      <span className="text-slate-200 flex-1">{value}</span>
    </div>
  );
}