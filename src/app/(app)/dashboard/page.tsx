import { db } from "@/lib/db";

async function getStats() {
  const leads = await db.lead.count();
  const qualified = await db.lead.count({
    where: { qualificationStatus: "QUALIFIED" },
  });
  const available = await db.lead.count({
    where: { inventoryStatus: "AVAILABLE_FOR_SALE" },
  });
  const sold = await db.lead.count({
    where: { inventoryStatus: "SOLD" },
  });
  const buyers = await db.buyer.count();
  const campaigns = await db.campaign.count();

  const revenue = await db.leadSale.aggregate({
    _sum: { sellingPrice: true },
    where: { paymentStatus: "PAID" },
  });

  return {
    leads,
    qualified,
    available,
    sold,
    buyers,
    campaigns,
    revenue: Number(revenue._sum.sellingPrice ?? 0),
  };
}

export default async function DashboardPage() {
  const s = await getStats();

  const cards = [
    { label: "Total Leads", value: s.leads },
    { label: "Qualified", value: s.qualified },
    { label: "Available for Sale", value: s.available },
    { label: "Sold", value: s.sold },
    { label: "Buyers", value: s.buyers },
    { label: "Campaigns", value: s.campaigns },
    {
      label: "Revenue (paid)",
      value: `$${s.revenue.toLocaleString()}`,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Overview of your lead generation operation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="p-5 rounded-xl bg-slate-950 border border-slate-800"
          >
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {c.label}
            </div>
            <div className="text-2xl font-semibold text-white mt-2">
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 rounded-xl bg-slate-950 border border-slate-800">
        <h2 className="text-lg font-medium text-white mb-2">Getting started</h2>
        <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
          <li>Create your first campaign under <strong className="text-slate-200">Campaigns</strong></li>
          <li>Add leads manually or import from CSV under <strong className="text-slate-200">Lead Inventory</strong></li>
          <li>Register buyers under <strong className="text-slate-200">Buyers</strong></li>
          <li>Record sales under <strong className="text-slate-200">Lead Sales</strong></li>
          <li>Track profitability under <strong className="text-slate-200">Revenue</strong></li>
        </ol>
      </div>
    </div>
  );
}