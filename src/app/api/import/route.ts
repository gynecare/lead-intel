import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { buildDedupKey } from "@/lib/dedup";
import { computeLeadScore } from "@/lib/scoring";
import Papa from "papaparse";
import type { DbField } from "@/lib/column-mapper";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const campaignId = (form.get("campaignId") as string) || null;
  const mappingJson = form.get("mapping") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
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

  // Build mapping: CSV header → DB field
  // If no mapping passed, auto-map
  let mapping: Record<string, DbField>;
  if (mappingJson) {
    mapping = JSON.parse(mappingJson);
  } else {
    const { autoMapHeaders } = await import("@/lib/column-mapper");
    mapping = autoMapHeaders(Object.keys(rows[0]));
  }

  // Helper: get value from row by DB field
  function getField(row: Record<string, string>, field: DbField): string | undefined {
    for (const [csvHeader, dbField] of Object.entries(mapping)) {
      if (dbField === field) {
        const v = row[csvHeader];
        return v ? v.trim() : undefined;
      }
    }
    return undefined;
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
    const companyName = getField(row, "companyName");

    if (!companyName) {
      results.errors++;
      results.errorDetails.push(`Row ${i + 2}: missing company name`);
      continue;
    }

    // Handle industry vs category fallback
    const industry = getField(row, "industry") || getField(row, "category");

    const website = getField(row, "website");
    const businessPhone = getField(row, "businessPhone");

    const dedupKey = buildDedupKey({ companyName, website, businessPhone });

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

    // Build notes with rating/reviews if present
    let notes = getField(row, "notes") || "";
    const rating = getField(row, "rating");
    const reviewCount = getField(row, "reviewCount");
    if (rating) notes += `${notes ? "\n" : ""}Rating: ${rating}`;
    if (reviewCount) notes += `${notes ? "\n" : ""}Reviews: ${reviewCount}`;

    const scoreResult = computeLeadScore({
      lead: {
        industry,
        country: getField(row, "country"),
        region: getField(row, "region"),
        city: getField(row, "city"),
        companySize: getField(row, "companySize"),
        contactName: getField(row, "contactName"),
        contactEmail: getField(row, "contactEmail"),
        contactPhone: getField(row, "contactPhone"),
        potentialRequirement: getField(row, "potentialRequirement"),
        website,
      },
      campaign,
    });

    const tagsRaw = getField(row, "tags");

    try {
      await db.lead.create({
        data: {
          campaignId: campaignId,
          companyName,
          industry: industry || null,
          businessType: getField(row, "businessType") || null,
          description: null,
          website: website || null,
          address: getField(row, "address") || null,
          country: normalizeCountry(getField(row, "country")),
          region: getField(row, "region") || null,
          city: getField(row, "city") || null,
          postalCode: getField(row, "postalCode") || null,
          businessPhone: businessPhone || null,
          businessEmail: getField(row, "businessEmail") || null,
          companySize: getField(row, "companySize") || null,
          contactName: getField(row, "contactName") || null,
          contactJobTitle: getField(row, "contactJobTitle") || null,
          contactEmail: getField(row, "contactEmail") || null,
          contactPhone: getField(row, "contactPhone") || null,
          potentialRequirement: getField(row, "potentialRequirement") || null,
          productService: getField(row, "productService") || null,
          estimatedValue: parseNumber(getField(row, "estimatedValue")),
          buyingTimeframe: getField(row, "buyingTimeframe") || null,
          notes: notes || null,
          source: "csv_import",
          sourceCollectedAt: new Date(),
          dedupKey,
          leadScore: scoreResult.score,
          scoreBreakdown: scoreResult.breakdown,
          inventoryStatus: "NEW",
          qualificationStatus: "UNQUALIFIED",
          tags: tagsRaw
            ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
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

function normalizeCountry(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toUpperCase();
  // Already 2-letter code
  if (/^[A-Z]{2}$/.test(trimmed)) return trimmed;
  // Common country names → codes
  const map: Record<string, string> = {
    "UNITED STATES": "US",
    USA: "US",
    "UNITED KINGDOM": "GB",
    UK: "GB",
    CANADA: "CA",
    AUSTRALIA: "AU",
    PAKISTAN: "PK",
    INDIA: "IN",
    GERMANY: "DE",
    FRANCE: "FR",
    "UNITED ARAB EMIRATES": "AE",
    UAE: "AE",
  };
  return map[trimmed] || null;
}

function parseNumber(raw?: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return isNaN(n) ? null : n;
}