-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'RESEARCHER', 'VIEWER');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LeadScore" AS ENUM ('A_PLUS', 'A', 'B', 'C', 'D', 'UNRATED');

-- CreateEnum
CREATE TYPE "QualificationStatus" AS ENUM ('UNQUALIFIED', 'POTENTIAL', 'QUALIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('NEW', 'RESEARCHING', 'VERIFIED', 'QUALIFIED', 'AVAILABLE_FOR_SALE', 'RESERVED', 'SOLD', 'DELIVERED', 'REJECTED', 'DUPLICATE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "Exclusivity" AS ENUM ('UNSPECIFIED', 'EXCLUSIVE', 'NON_EXCLUSIVE');

-- CreateEnum
CREATE TYPE "BuyerStatus" AS ENUM ('ACTIVE', 'PAUSED', 'BLACKLISTED', 'PROSPECT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'INVOICED', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('NOT_DELIVERED', 'DELIVERED', 'ACKNOWLEDGED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('NONE', 'REQUESTED', 'APPROVED', 'REPLACED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "targetCountries" TEXT[],
    "targetRegions" TEXT[],
    "targetCities" TEXT[],
    "targetIndustries" TEXT[],
    "targetBusinessTypes" TEXT[],
    "targetCompanySize" TEXT,
    "requiredProduct" TEXT,
    "keywords" TEXT[],
    "targetJobTitles" TEXT[],
    "leadRequirements" TEXT,
    "qualificationCriteria" JSONB,
    "targetLeadCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "companyName" TEXT NOT NULL,
    "industry" TEXT,
    "businessType" TEXT,
    "description" TEXT,
    "website" TEXT,
    "address" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "businessPhone" TEXT,
    "businessEmail" TEXT,
    "socialProfiles" JSONB,
    "companySize" TEXT,
    "contactName" TEXT,
    "contactJobTitle" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "potentialRequirement" TEXT,
    "productService" TEXT,
    "estimatedValue" DECIMAL(12,2),
    "estimatedValueCurrency" TEXT DEFAULT 'USD',
    "buyingTimeframe" TEXT,
    "notes" TEXT,
    "leadScore" "LeadScore" NOT NULL DEFAULT 'UNRATED',
    "scoreBreakdown" JSONB,
    "qualificationStatus" "QualificationStatus" NOT NULL DEFAULT 'UNQUALIFIED',
    "inventoryStatus" "InventoryStatus" NOT NULL DEFAULT 'NEW',
    "businessVerified" BOOLEAN NOT NULL DEFAULT false,
    "contactVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "requirementVerified" BOOLEAN NOT NULL DEFAULT false,
    "sourceVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastVerifiedAt" TIMESTAMP(3),
    "source" TEXT,
    "sourceUrl" TEXT,
    "sourceCollectedAt" TIMESTAMP(3),
    "exclusivity" "Exclusivity" NOT NULL DEFAULT 'UNSPECIFIED',
    "tags" TEXT[],
    "dedupKey" TEXT,
    "acquisitionCost" DECIMAL(12,2),
    "acquisitionCurrency" TEXT DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buyer" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "industry" TEXT,
    "country" TEXT,
    "city" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "productsServices" TEXT[],
    "wantedLeadTypes" TEXT[],
    "targetLocations" TEXT[],
    "preferredQuality" "LeadScore",
    "preferredVolume" TEXT,
    "priceWillingToPay" DECIMAL(12,2),
    "priceCurrency" TEXT DEFAULT 'USD',
    "paymentHistory" TEXT,
    "feedback" TEXT,
    "status" "BuyerStatus" NOT NULL DEFAULT 'PROSPECT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadSale" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "dateOffered" TIMESTAMP(3),
    "dateSold" TIMESTAMP(3),
    "sellingPrice" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'NOT_DELIVERED',
    "exclusivity" "Exclusivity" NOT NULL DEFAULT 'UNSPECIFIED',
    "buyerFeedback" TEXT,
    "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NONE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignCost" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignCost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_dedupKey_key" ON "Lead"("dedupKey");

-- CreateIndex
CREATE INDEX "Lead_country_city_idx" ON "Lead"("country", "city");

-- CreateIndex
CREATE INDEX "Lead_industry_idx" ON "Lead"("industry");

-- CreateIndex
CREATE INDEX "Lead_leadScore_idx" ON "Lead"("leadScore");

-- CreateIndex
CREATE INDEX "Lead_inventoryStatus_idx" ON "Lead"("inventoryStatus");

-- CreateIndex
CREATE INDEX "Lead_campaignId_idx" ON "Lead"("campaignId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSale" ADD CONSTRAINT "LeadSale_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSale" ADD CONSTRAINT "LeadSale_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignCost" ADD CONSTRAINT "CampaignCost_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
