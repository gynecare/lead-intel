import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (!body.leadId || !body.buyerId || body.sellingPrice == null) {
    return NextResponse.json(
      { error: "Lead, buyer and selling price are required" },
      { status: 400 }
    );
  }

  try {
    const sale = await db.leadSale.create({
      data: {
        leadId: body.leadId,
        buyerId: body.buyerId,
        dateOffered: body.dateOffered ? new Date(body.dateOffered) : null,
        dateSold: body.dateSold ? new Date(body.dateSold) : new Date(),
        sellingPrice: body.sellingPrice,
        currency: body.currency || "USD",
        paymentStatus: body.paymentStatus || "PENDING",
        deliveryStatus: body.deliveryStatus || "NOT_DELIVERED",
        exclusivity: body.exclusivity || "UNSPECIFIED",
        buyerFeedback: body.buyerFeedback || null,
        refundStatus: body.refundStatus || "NONE",
        notes: body.notes || null,
      },
    });

    // Update lead inventory status
    await db.lead.update({
      where: { id: body.leadId },
      data: { inventoryStatus: "SOLD" },
    });

    return NextResponse.json({ id: sale.id });
  } catch (err) {
    console.error("Sale create failed:", err);
    return NextResponse.json(
      { error: "Database error. Check server logs." },
      { status: 500 }
    );
  }
}