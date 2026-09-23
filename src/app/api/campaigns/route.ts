import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await db.campaign.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json(
      { error: "Campaign name is required" },
      { status: 400 }
    );
  }

  try {
    const campaign = await db.campaign.create({
      data: {
        name: body.name,
        targetCountries: body.targetCountries ?? [],
        targetRegions: body.targetRegions ?? [],
        targetCities: body.targetCities ?? [],
        targetIndustries: body.targetIndustries ?? [],
        targetBusinessTypes: body.targetBusinessTypes ?? [],
        targetCompanySize: body.targetCompanySize ?? null,
        requiredProduct: body.requiredProduct ?? null,
        keywords: body.keywords ?? [],
        targetJobTitles: body.targetJobTitles ?? [],
        leadRequirements: body.leadRequirements ?? null,
        targetLeadCount: body.targetLeadCount ?? 0,
        notes: body.notes ?? null,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ id: campaign.id });
  } catch (err) {
    console.error("Campaign create failed:", err);
    return NextResponse.json(
      { error: "Database error. Check server logs." },
      { status: 500 }
    );
  }
}