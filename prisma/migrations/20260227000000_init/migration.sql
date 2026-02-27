-- CreateTable
CREATE TABLE "Antibiotic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "awareGroup" TEXT NOT NULL,
    "adultDoseText" TEXT NOT NULL,
    "renalAdjustmentText" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,

    CONSTRAINT "Antibiotic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfectionGuide" (
    "id" TEXT NOT NULL,
    "infectionKey" TEXT NOT NULL,
    "setting" TEXT NOT NULL,
    "recommendedOptionsJson" TEXT NOT NULL,
    "durationRulesJson" TEXT NOT NULL,
    "redFlagsJson" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,

    CONSTRAINT "InfectionGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "age" INTEGER NOT NULL,
    "sex" TEXT NOT NULL,
    "pregnancy" BOOLEAN NOT NULL,
    "allergiesText" TEXT NOT NULL,
    "creatinineOrEgfr" TEXT NOT NULL,
    "setting" TEXT NOT NULL,
    "suspectedInfectionKey" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "symptomsText" TEXT NOT NULL,
    "chosenAntibiotic" TEXT,
    "chosenDose" TEXT,
    "chosenDurationDays" INTEGER,
    "justificationText" TEXT NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summaryText" TEXT NOT NULL,
    "suggestedRegimensJson" TEXT NOT NULL,
    "awareWarningsJson" TEXT NOT NULL,
    "durationWarningJson" TEXT NOT NULL,
    "reviewDueAt" TIMESTAMP(3) NOT NULL,
    "evidenceLinksJson" TEXT NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caseId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "detailJson" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricDaily" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "accessCount" INTEGER NOT NULL,
    "watchCount" INTEGER NOT NULL,
    "reserveCount" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,

    CONSTRAINT "MetricDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Antibiotic_name_key" ON "Antibiotic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InfectionGuide_infectionKey_setting_key" ON "InfectionGuide"("infectionKey", "setting");

-- CreateIndex
CREATE UNIQUE INDEX "MetricDaily_date_key" ON "MetricDaily"("date");

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

