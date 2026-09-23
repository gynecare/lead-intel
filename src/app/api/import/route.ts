import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { buildDedupKey } from "@/lib/dedup";
import { computeLeadScore } from "@/lib/scoring";
import Papa from "papaparse";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const campaignId = (form.get("campaignId") as string) || null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  if (parsed.errors.length > 0) {
    return NextResponse.json(
      { error: `CSV parse error: ${parsed.errors[0].message}` },
      { status: 400 }
    );
  }

  const rows = parsed.data;
  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV has no rows" }, { status: 400 });
  }

  const campaign = campaignId
    ? await db.campaign.findUnique({ where: { id: campaignId } })
    : null;

  const results = {
    total: rows.length,
    created: 0,
    duplicates: 0,
    errors: 0,
    errorDetails: [] as string[],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const companyName = (row.company_name || row.company || row.name || "").trim();

    if (!companyName) {
      results.errors++;
      results.errorDetails.push(`Row ${i + 2}: missing company_name`);
      continue;
    }

    const dedupKey = buildDedupKey({
      companyName,
      website: row.website,
      businessPhone: row.business_phone || row.phone,
    });

    if (dedupKey) {
      const existing = await db.lead.findUnique({ where: { dedupKey } });
      if (existing) {
        results.duplicates++;
        results.errorDetails.push(
          `Row ${i + 2}: duplicate of "${existing.companyName}"`
        );
        continue;
      }
    }

    const scoreResult = computeLeadScore({
      lead: {
        industry: row.industry,
        country: row.country,
        region: row.region || row.state,
        city: row.city,
        companySize: row.company_size,
        contactName: row.contact_name,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        potentialRequirement: row.potential_requirement || row.requirement,
        website: row.website,
      },
      campaign,
    });

    try {
      await db.lead.create({
        data: {
          campaignId: campaignId,
          companyName,
          industry: row.industry || null,
          businessType: row.business_type || null,
          description: row.description || null,
          website: row.website || null,
          address: row.address || null,
          country: row.country ? row.country.toUpperCase().slice(0, 2) : null,
          region: row.region || row.state || null,
          city: row.city || null,
          postalCode: row.postal_code || row.zip || null,
          businessPhone: row.business_phone || row.phone || null,
          businessEmail: row.business_email || row.email || null,
          companySize: row.company_size || null,
          contactName: row.contact_name || null,
          contactJobTitle: row.contact_job_title || row.contact_title || null,
          contactEmail: row.contact_email || null,
          contactPhone: row.contact_phone || null,
          potentialRequirement: row.potential_requirement || row.requirement || null,
          productService: row.product_service || null,
          estimatedValue: row.estimated_value ? Number(row.estimated_value) : null,
          buyingTimeframe: row.buying_timeframe || null,
          notes: row.notes || null,
          source: "csv_import",
          sourceCollectedAt: new Date(),
          dedupKey,
          leadScore: scoreResult.score,
          scoreBreakdown: scoreResult.breakdown,
          inventoryStatus: "NEW",
          qualificationStatus: "UNQUALIFIED",
          tags: row.tags
            ? row.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
        },
      });
      results.created++;
    } catch (err) {
      results.errors++;
      results.errorDetails.push(
        `Row ${i + 2}: ${err instanceof Error ? err.message : "unknown error"}`
      );
    }
  }

  return NextResponse.json(results);
}