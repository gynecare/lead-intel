import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const buyers = await db.buyer.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, companyName: true },
  });
  return NextResponse.json({ buyers });
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
      { error: "Buyer company name is required" },
      { status: 400 }
    );
  }

  try {
    const buyer = await db.buyer.create({
      data: {
        companyName: body.companyName,
        industry: body.industry || null,
        country: body.country || null,
        city: body.city || null,
        contactName: body.contactName || null,
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
        productsServices: body.productsServices ?? [],
        wantedLeadTypes: body.wantedLeadTypes ?? [],
        targetLocations: body.targetLocations ?? [],
        preferredQuality: body.preferredQuality || null,
        preferredVolume: body.preferredVolume || null,
        priceWillingToPay: body.priceWillingToPay ?? null,
        priceCurrency: body.priceCurrency || "USD",
        paymentHistory: body.paymentHistory || null,
        feedback: body.feedback || null,
        status: body.status || "PROSPECT",
      },
    });
    return NextResponse.json({ id: buyer.id });
  } catch (err) {
    console.error("Buyer create failed:", err);
    return NextResponse.json(
      { error: "Database error. Check server logs." },
      { status: 500 }
    );
  }
}