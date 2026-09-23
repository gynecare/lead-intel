import { db } from "@/lib/db";

export default async function RevenuePage() {
  const [sales, leads, campaignCosts] = await Promise.all([
    db.leadSale.findMany({
      include: { lead: true, buyer: true },
    }),
    db.lead.findMany({
      select: {
        id: true,
        acquisitionCost: true,
        acquisitionCurrency: true,
        country: true,
        industry: true,
      },
    }),
    db.campaignCost.findMany(),
  ]);

  const paidSales = sales.filter((s) => s.paymentStatus === "PAID");
  const revenue = paidSales.reduce((a, s) => a + Number(s.sellingPrice), 0);
  const salesCount = paidSales.length;
  const avgPrice = salesCount > 0 ? revenue / salesCount : 0;

  const acquisitionTotal =
    leads.reduce((a, l) => a + Number(l.acquisitionCost ?? 0), 0) +
    campaignCosts.reduce((a, c) => a + Number(c.amount), 0);
  const avgAcqCost = leads.length > 0 ? acquisitionTotal / leads.length : 0;
  const grossProfit = revenue - acquisitionTotal;
  const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  // Group by country
  const byCountry: Record<string, number> = {};
  paidSales.forEach((s) => {
    const key = s.lead.country ?? "Unknown";
    byCountry[key] = (byCountry[key] ?? 0) + Number(s.sellingPrice);
  });

  const byIndustry: Record<string, number> = {};
  paidSales.forEach((s) => {
    const key = s.lead.industry ?? "Unknown";
    byIndustry[key] = (byIndustry[key] ?? 0) + Number(s.sellingPrice);
  });

  const byBuyer: Record<string, number> = {};
  paidSales.forEach((s) => {
    const key = s.buyer.companyName;
    byBuyer[key] = (byBuyer[key] ?? 0) + Number(s.sellingPrice);
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-white mb-1">Revenue</h1>
      <p className="text-slate-400 text-sm mb-8">
        Profitability across all sales, buyers, and locations
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Revenue (paid)" value={`$${revenue.toLocaleString()}`} />
        <Metric label="Avg lead price" value={`$${avgPrice.toFixed(2)}`} />
        <Metric label="Acquisition cost" value={`$${acquisitionTotal.toFixed(2)}`} />
        <Metric
          label="Gross profit"
          value={`$${grossProfit.toFixed(2)}`}
          accent={grossProfit >= 0 ? "green" : "red"}
        />
        <Metric label="Margin" value={`${margin.toFixed(1)}%`} />
        <Metric label="Avg acq cost / lead" value={`$${avgAcqCost.toFixed(2)}`} />
        <Metric label="Sales (paid)" value={salesCount} />
        <Metric label="Total leads" value={leads.length} />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Breakdown title="Revenue by Country" data={byCountry} />
        <Breakdown title="Revenue by Industry" data={byIndustry} />
        <Breakdown title="Revenue by Buyer" data={byBuyer} />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "green" | "red";
}) {
  const colorClass =
    accent === "green"
      ? "text-green-400"
      : accent === "red"
      ? "text-red-400"
      : "text-white";
  return (
    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className={`text-2xl font-semibold mt-2 ${colorClass}`}>{value}</div>
    </div>
  );
}

function Breakdown({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = entries[0]?.[1] ?? 1;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <h2 className="text-white font-medium text-sm uppercase tracking-wide mb-4">
        {title}
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">No data</p>
      ) : (
        <div className="space-y-3">
          {entries.slice(0, 8).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 truncate">{key}</span>
                <span className="text-slate-400">
                  ${value.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}