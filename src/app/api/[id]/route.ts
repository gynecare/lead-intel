import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { computeLeadScore } from "@/lib/scoring";

async function authUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await db.lead.findUnique({
    where: { id },
    include: { campaign: true },
  });

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  // Load current lead + campaign for rescoring
  const existing = await db.lead.findUnique({
    where: { id },
    include: { campaign: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const merged = {
    industry: body.industry ?? existing.industry,
    country: body.country ?? existing.country,
    region: body.region ?? existing.region,
    city: body.city ?? existing.city,
    companySize: body.companySize ?? existing.companySize,
    contactName: body.contactName ?? existing.contactName,
    contactEmail: body.contactEmail ?? existing.contactEmail,
    contactPhone: body.contactPhone ?? existing.contactPhone,
    potentialRequirement:
      body.potentialRequirement ?? existing.potentialRequirement,
    website: body.website ?? existing.website,
    businessVerified: body.businessVerified ?? existing.businessVerified,
    emailVerified: body.emailVerified ?? existing.emailVerified,
    phoneVerified: body.phoneVerified ?? existing.phoneVerified,
    requirementVerified:
      body.requirementVerified ?? existing.requirementVerified,
    sourceVerified: body.sourceVerified ?? existing.sourceVerified,
  };

  const scoreResult = computeLeadScore({
    lead: merged,
    campaign: existing.campaign,
  });

  try {
    await db.lead.update({
      where: { id },
      data: {
        ...body,
        leadScore: scoreResult.score,
        scoreBreakdown: scoreResult.breakdown,
        lastVerifiedAt:
          body.businessVerified ||
          body.emailVerified ||
          body.phoneVerified ||
          body.requirementVerified ||
          body.sourceVerified
            ? new Date()
            : existing.lastVerifiedAt,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead update failed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // Delete related sales first
    await db.leadSale.deleteMany({ where: { leadId: id } });
    await db.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead delete failed:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}