import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { buildDedupKey } from "@/lib/dedup";
import { computeLeadScore } from "@/lib/scoring";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const country = searchParams.get("country") ?? "";
  const status = searchParams.get("status") ?? "";
  const score = searchParams.get("score") ?? "";
  const campaignId = searchParams.get("campaignId") ?? "";

  const leads = await db.lead.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { companyName: { contains: q, mode: "insensitive" } },
                { industry: { contains: q, mode: "insensitive" } },
                { city: { contains: q, mode: "insensitive" } },
                { website: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        country ? { country } : {},
        status ? { inventoryStatus: status as any } : {},
        score ? { leadScore: score as any } : {},
        campaignId ? { campaignId } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { campaign: { select: { name: true, id: true } } },
    take: 200,
  });

  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (!body.companyName || typeof body.companyName !== "string") {
    return NextResponse.json(
      { error: "Company name is required" },
      { status: 400 }
    );
  }

  const dedupKey = buildDedupKey({
    companyName: body.companyName,
    website: body.website,
    businessPhone: body.businessPhone,
  });

  // Duplicate check
  if (dedupKey) {
    const existing = await db.lead.findUnique({ where: { dedupKey } });
    if (existing) {
      return NextResponse.json(
        {
          error: "Duplicate lead detected",
          existingId: existing.id,
          companyName: existing.companyName,
        },
        { status: 409 }
      );
    }
  }

  // Load campaign for scoring
  const campaign = body.campaignId
    ? await db.campaign.findUnique({ where: { id: body.campaignId } })
    : null;

  const scoreResult = computeLeadScore({
    lead: {
      industry: body.industry,
      country: body.country,
      region: body.region,
      city: body.city,
      companySize: body.companySize,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      potentialRequirement: body.potentialRequirement,
      website: body.website,
      businessVerified: body.businessVerified,
      emailVerified: body.emailVerified,
      phoneVerified: body.phoneVerified,
      requirementVerified: body.requirementVerified,
      sourceVerified: body.sourceVerified,
    },
    campaign,
  });

  try {
    const lead = await db.lead.create({
      data: {
        campaignId: body.campaignId || null,
        companyName: body.companyName,
        industry: body.industry || null,
        businessType: body.businessType || null,
        description: body.description || null,
        website: body.website || null,
        address: body.address || null,
        country: body.country || null,
        region: body.region || null,
        city: body.city || null,
        postalCode: body.postalCode || null,
        businessPhone: body.businessPhone || null,
        businessEmail: body.businessEmail || null,
        companySize: body.companySize || null,
        contactName: body.contactName || null,
        contactJobTitle: body.contactJobTitle || null,
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
        potentialRequirement: body.potentialRequirement || null,
        productService: body.productService || null,
        estimatedValue: body.estimatedValue ?? null,
        estimatedValueCurrency: body.estimatedValueCurrency || "USD",
        buyingTimeframe: body.buyingTimeframe || null,
        notes: body.notes || null,
        source: body.source || "manual",
        sourceUrl: body.sourceUrl || null,
        sourceCollectedAt: new Date(),
        tags: body.tags ?? [],
        acquisitionCost: body.acquisitionCost ?? null,
        acquisitionCurrency: body.acquisitionCurrency || "USD",
        dedupKey,
        leadScore: scoreResult.score,
        scoreBreakdown: scoreResult.breakdown,
        inventoryStatus: "NEW",
        qualificationStatus: "UNQUALIFIED",
        businessVerified: !!body.businessVerified,
        contactVerified: !!body.contactVerified,
        emailVerified: !!body.emailVerified,
        phoneVerified: !!body.phoneVerified,
        requirementVerified: !!body.requirementVerified,
        sourceVerified: !!body.sourceVerified,
      },
    });

    return NextResponse.json({ id: lead.id });
  } catch (err) {
    console.error("Lead create failed:", err);
    return NextResponse.json(
      { error: "Database error. Check server logs." },
      { status: 500 }
    );
  }
}