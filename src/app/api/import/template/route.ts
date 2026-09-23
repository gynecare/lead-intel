const TEMPLATE_COLUMNS = [
  "company_name",
  "industry",
  "business_type",
  "website",
  "country",
  "region",
  "city",
  "postal_code",
  "business_phone",
  "business_email",
  "company_size",
  "contact_name",
  "contact_job_title",
  "contact_email",
  "contact_phone",
  "potential_requirement",
  "product_service",
  "estimated_value",
  "buying_timeframe",
  "tags",
  "notes",
];

export async function GET() {
  const header = TEMPLATE_COLUMNS.join(",");
  const example = [
    "Acme Solar Co",
    "Solar",
    "B2B",
    "https://acmesolar.com",
    "US",
    "CA",
    "Los Angeles",
    "90001",
    "+1-555-0100",
    "info@acmesolar.com",
    "10-50",
    "John Smith",
    "CEO",
    "john@acmesolar.com",
    "+1-555-0101",
    "Looking to install commercial rooftop solar in 2026",
    "Solar installation",
    "100000",
    "3-6 months",
    "Solar,Commercial,Hot",
    "Referral from partner",
  ]
    .map((v) => `"${v}"`)
    .join(",");

  const csv = `${header}\n${example}\n`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="lead-import-template.csv"',
    },
  });
}