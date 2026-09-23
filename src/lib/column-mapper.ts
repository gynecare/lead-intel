// Maps common CSV column names from lead scrapers to our DB fields

export type DbField =
  | "companyName"
  | "industry"
  | "businessType"
  | "website"
  | "country"
  | "region"
  | "city"
  | "postalCode"
  | "address"
  | "businessPhone"
  | "businessEmail"
  | "companySize"
  | "contactName"
  | "contactJobTitle"
  | "contactEmail"
  | "contactPhone"
  | "potentialRequirement"
  | "productService"
  | "estimatedValue"
  | "buyingTimeframe"
  | "tags"
  | "notes"
  | "rating"
  | "reviewCount"
  | "category"
  | "skip";

export const DB_FIELDS: { key: DbField; label: string; required?: boolean }[] = [
  { key: "companyName", label: "Company Name", required: true },
  { key: "industry", label: "Industry" },
  { key: "category", label: "Category (maps to Industry if industry empty)" },
  { key: "businessType", label: "Business Type" },
  { key: "website", label: "Website" },
  { key: "country", label: "Country (ISO 2-letter)" },
  { key: "region", label: "Region / State" },
  { key: "city", label: "City" },
  { key: "postalCode", label: "Postal Code" },
  { key: "address", label: "Street Address" },
  { key: "businessPhone", label: "Business Phone" },
  { key: "businessEmail", label: "Business Email" },
  { key: "companySize", label: "Company Size" },
  { key: "contactName", label: "Contact Name" },
  { key: "contactJobTitle", label: "Contact Job Title" },
  { key: "contactEmail", label: "Contact Email" },
  { key: "contactPhone", label: "Contact Phone" },
  { key: "potentialRequirement", label: "Requirement" },
  { key: "productService", label: "Product / Service" },
  { key: "estimatedValue", label: "Estimated Value" },
  { key: "buyingTimeframe", label: "Buying Timeframe" },
  { key: "rating", label: "Rating (kept in notes)" },
  { key: "reviewCount", label: "Review Count (kept in notes)" },
  { key: "tags", label: "Tags" },
  { key: "notes", label: "Notes" },
  { key: "skip", label: "— Ignore this column —" },
];

// Fuzzy rules: (pattern to match in CSV header) → DB field
const RULES: { match: RegExp; field: DbField }[] = [
  // Company name
  { match: /^(company|business|name|title|store|place)[\s_-]*(name)?$/i, field: "companyName" },
  { match: /^(company|business|store|place)[\s_-]*name$/i, field: "companyName" },
  { match: /^name$/i, field: "companyName" },
  { match: /^title$/i, field: "companyName" },

  // Industry / category
  { match: /^(industry|sector)$/i, field: "industry" },
  { match: /^(category|categories|type|business[\s_-]*type)$/i, field: "category" },
  { match: /^subtype$/i, field: "businessType" },

  // Website
  { match: /^(website|url|site|web|domain|homepage)$/i, field: "website" },
  { match: /^website[\s_-]*(url)?$/i, field: "website" },

  // Location
  { match: /^(country|country[\s_-]*code)$/i, field: "country" },
  { match: /^(state|region|province|state[\s_-]*code)$/i, field: "region" },
  { match: /^(city|town|locality)$/i, field: "city" },
  { match: /^(postal[\s_-]*code|zip|zip[\s_-]*code|postcode)$/i, field: "postalCode" },
  { match: /^(address|street|full[\s_-]*address|location)$/i, field: "address" },

  // Phone / email
  { match: /^(phone|telephone|tel|business[\s_-]*phone|phone[\s_-]*number)$/i, field: "businessPhone" },
  { match: /^(email|business[\s_-]*email|e[\s_-]*mail)$/i, field: "businessEmail" },

  // Company size
  { match: /^(size|company[\s_-]*size|employees|employee[\s_-]*count)$/i, field: "companySize" },

  // Contact
  { match: /^(contact[\s_-]*name|owner|founder|manager|contact[\s_-]*person)$/i, field: "contactName" },
  { match: /^(job[\s_-]*title|position|role|designation)$/i, field: "contactJobTitle" },
  { match: /^(contact[\s_-]*email|owner[\s_-]*email)$/i, field: "contactEmail" },
  { match: /^(contact[\s_-]*phone|owner[\s_-]*phone|mobile)$/i, field: "contactPhone" },

  // Opportunity
  { match: /^(requirement|needs|demand|potential[\s_-]*requirement)$/i, field: "potentialRequirement" },
  { match: /^(product|service|products|services|offering)$/i, field: "productService" },
  { match: /^(value|estimated[\s_-]*value|project[\s_-]*value)$/i, field: "estimatedValue" },
  { match: /^(timeframe|buying[\s_-]*timeframe|urgency)$/i, field: "buyingTimeframe" },

  // Scraper-specific
  { match: /^(rating|stars|score|google[\s_-]*rating)$/i, field: "rating" },
  { match: /^(reviews?|review[\s_-]*count|num[\s_-]*reviews?)$/i, field: "reviewCount" },

  // Tags & notes
  { match: /^(tags?|labels?|keywords?)$/i, field: "tags" },
  { match: /^(notes?|comments?|description)$/i, field: "notes" },
];

export function autoMapHeaders(csvHeaders: string[]): Record<string, DbField> {
  const mapping: Record<string, DbField> = {};
  const usedFields = new Set<DbField>();

  for (const header of csvHeaders) {
    const normalized = header.trim();
    let matched: DbField | null = null;

    for (const rule of RULES) {
      if (rule.match.test(normalized) && !usedFields.has(rule.field)) {
        matched = rule.field;
        break;
      }
    }

    if (matched) {
      mapping[header] = matched;
      usedFields.add(matched);
    } else {
      mapping[header] = "skip";
    }
  }

  return mapping;
}