import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 25) ?? null,
    hasPublishable: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    publishablePrefix:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.slice(0, 20) ?? null,
    hasSecret: !!process.env.SUPABASE_SECRET_KEY,
    hasDb: !!process.env.DATABASE_URL,
    hasDirect: !!process.env.DIRECT_URL,
  });
}