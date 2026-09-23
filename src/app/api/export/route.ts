import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import Papa from "papaparse";

const ALL_COLUMNS = {
  id: "Lead ID",
  company_name: "Company Name",
  industry: "Industry",
  business_type: "Business Type",
  website: "Website",
  country: "Country",
  region: "Region",
  city: "City",
  postal_code: "Postal Code",
  business_phone: "Business Phone",
  business_email: "Business Email",
  company_size: "Company Size",
  contact_name: "Contact Name",
  contact_job_title: "Contact Job Title",
  contact_email: "Contact Email",
  contact_phone: "Contact Phone",
  potential_requirement: "Requirement",
  product_service: "Product/Service",
  estimated_value: "Estimated Value",
  buying_timeframe: "Buying Timeframe",
  lead_score: "Lead Score",
  qualification_status: "Qualification",
  inventory_status: "Status",
  tags: "Tags",
  source: "Source",
  notes: "Notes",
} as const;

type ColumnKey = keyof typeof ALL_COLUMNS;

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");
  const status = searchParams.get("status");
  const score = searchParams.get("score");
  const columnsParam = searchParams.get("columns");
  const template = searchParams.get("template");

  const columns: ColumnKey[] = columnsParam
    ? (columnsParam.split(",") as ColumnKey[]).filter((c) =>
        Object.keys(ALL_COLUMNS).includes(c)
      )
    : (Object.keys(ALL_COLUMNS) as ColumnKey[]);

  const leads = await db.lead.findMany({
    where: {
      AND: [
        campaignId ? { campaignId } : {},
        status ? { inventoryStatus: status as never } : {},
        score ? { leadScore: score as never } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = leads.map((l) => {
    const row: Record<string, string | number> = {};
    for (const col of columns) {
      const value = (l as Record<string, unknown>)[col];
      if (value === null || value === undefined) row[ALL_COLUMNS[col]] = "";
      else if (value instanceof Date) row[ALL_COLUMNS[col]] = value.toISOString();
      else if (Array.isArray(value)) row[ALL_COLUMNS[col]] = value.join(", ");
      else if (typeof value === "object" && "toString" in value)
        row[ALL_COLUMNS[col]] = String(value);
      else row[ALL_COLUMNS[col]] = value as string | number;
    }
    return row;
  });

  const csv = Papa.unparse(rows);
  const filename = template
    ? `leads-export-${template}-${Date.now()}.csv`
    : `leads-export-${Date.now()}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}