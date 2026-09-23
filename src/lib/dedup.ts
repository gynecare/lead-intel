export function buildDedupKey(input: {
  companyName?: string | null;
  website?: string | null;
  businessPhone?: string | null;
}): string | null {
  const name = (input.companyName ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

  const domain = extractDomain(input.website);
  const phone = (input.businessPhone ?? "").replace(/\D/g, "");

  const parts = [name, domain, phone].filter(Boolean);
  if (parts.length === 0) return null;

  return parts.join("|");
}

function extractDomain(url?: string | null): string {
  if (!url) return "";
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}