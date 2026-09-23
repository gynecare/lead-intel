import type { Campaign, Lead } from "@prisma/client";

export type ScoreInput = {
  lead: Partial<Lead>;
  campaign: Campaign | null;
};

export type ScoreResult = {
  score: "A_PLUS" | "A" | "B" | "C" | "D";
  breakdown: {
    industryMatch: number;
    locationMatch: number;
    sizeMatch: number;
    hasContact: number;
    hasRequirement: number;
    hasWebsite: number;
    verificationBonus: number;
  };
  total: number;
};

export function computeLeadScore({ lead, campaign }: ScoreInput): ScoreResult {
  const breakdown = {
    industryMatch: 0,
    locationMatch: 0,
    sizeMatch: 0,
    hasContact: 0,
    hasRequirement: 0,
    hasWebsite: 0,
    verificationBonus: 0,
  };

  // Industry match — 20 pts
  if (
    lead.industry &&
    campaign?.targetIndustries?.some(
      (i) => i.toLowerCase() === lead.industry!.toLowerCase()
    )
  ) {
    breakdown.industryMatch = 20;
  }

  // Location match — 20 pts
  const countryMatch =
    lead.country && campaign?.targetCountries?.includes(lead.country);
  const regionMatch =
    lead.region && campaign?.targetRegions?.includes(lead.region);
  const cityMatch = lead.city && campaign?.targetCities?.includes(lead.city);

  if (cityMatch) breakdown.locationMatch = 20;
  else if (regionMatch) breakdown.locationMatch = 15;
  else if (countryMatch) breakdown.locationMatch = 10;

  // Company size match — 10 pts
  if (lead.companySize && campaign?.targetCompanySize) {
    breakdown.sizeMatch = 10;
  }

  // Has a named contact — 15 pts
  if (lead.contactName && (lead.contactEmail || lead.contactPhone)) {
    breakdown.hasContact = 15;
  } else if (lead.contactName) {
    breakdown.hasContact = 7;
  }

  // Has a requirement described — 15 pts
  if (lead.potentialRequirement && lead.potentialRequirement.length > 20) {
    breakdown.hasRequirement = 15;
  } else if (lead.potentialRequirement) {
    breakdown.hasRequirement = 8;
  }

  // Has website — 10 pts
  if (lead.website) breakdown.hasWebsite = 10;

  // Verification bonus — 10 pts total (2 per check)
  const checks = [
    lead.businessVerified,
    lead.emailVerified,
    lead.phoneVerified,
    lead.requirementVerified,
    lead.sourceVerified,
  ];
  breakdown.verificationBonus = checks.filter(Boolean).length * 2;

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  let score: ScoreResult["score"] = "D";
  if (total >= 80) score = "A_PLUS";
  else if (total >= 60) score = "A";
  else if (total >= 40) score = "B";
  else if (total >= 20) score = "C";

  return { score, breakdown, total };
}