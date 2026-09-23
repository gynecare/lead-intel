import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

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
  const buyer = await db.buyer.findUnique({ where: { id } });
  if (!buyer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ buyer });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  try {
    await db.buyer.update({ where: { id }, data: body });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Buyer update failed:", err);
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
    const saleCount = await db.leadSale.count({ where: { buyerId: id } });
    if (saleCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: buyer has ${saleCount} sale record(s). Change status to BLACKLISTED instead.`,
        },
        { status: 400 }
      );
    }
    await db.buyer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Buyer delete failed:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}