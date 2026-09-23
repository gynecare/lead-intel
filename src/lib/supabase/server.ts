import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Debug log — will show in Vercel Runtime Logs
  console.log("[supabase/server] env check:", {
    hasUrl: !!url,
    urlStartsCorrectly: url?.startsWith("https://") ?? false,
    hasKey: !!key,
    keyStartsCorrectly: key?.startsWith("sb_") ?? false,
  });

  if (!url || !key) {
    throw new Error(
      `Supabase client missing env vars. URL set: ${!!url}, Key set: ${!!key}`
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // called from Server Component — safe to ignore
        }
      },
    },
  });
}