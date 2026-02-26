import { PrismaClient } from "@prisma/client";
import { subDays, subHours } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.case.deleteMany();
  await prisma.metricDaily.deleteMany();
  await prisma.infectionGuide.deleteMany();
  await prisma.antibiotic.deleteMany();

  await prisma.antibiotic.createMany({
    data: [
      { name: "Nitrofurantoin", awareGroup: "ACCESS", adultDoseText: "100 mg PO q12h", renalAdjustmentText: "Avoid if eGFR <30", notes: "Uncomplicated lower UTI", sourceUrl: "https://aware.essentialmeds.org/" },
      { name: "Amoxicillin", awareGroup: "ACCESS", adultDoseText: "500 mg PO q8h", renalAdjustmentText: "Adjust if severe impairment", notes: "CAP/SSTI if susceptible", sourceUrl: "https://aware.essentialmeds.org/" },
      { name: "Ceftriaxone", awareGroup: "WATCH", adultDoseText: "1-2 g IV daily", renalAdjustmentText: "Usually no adjustment", notes: "Severe infection criteria", sourceUrl: "https://aware.essentialmeds.org/" },
      { name: "Ciprofloxacin", awareGroup: "WATCH", adultDoseText: "500 mg PO q12h", renalAdjustmentText: "Reduce with low eGFR", notes: "Use with caution", sourceUrl: "https://aware.essentialmeds.org/" },
      { name: "Linezolid", awareGroup: "RESERVE", adultDoseText: "600 mg IV/PO q12h", renalAdjustmentText: "Monitor prolonged use", notes: "MDR indications only", sourceUrl: "https://aware.essentialmeds.org/" }
    ]
  });

  const guides = [
    {
      infectionKey: "uti_uncomplicated",
      setting: "primary_care",
      recommendedOptionsJson: JSON.stringify([
        { antibioticName: "Nitrofurantoin", doseText: "100 mg PO q12h", route: "PO", durationDaysRange: [5, 5], criteria: "No pyelonephritis signs" },
        { antibioticName: "Amoxicillin", doseText: "500 mg PO q8h", route: "PO", durationDaysRange: [5, 7], criteria: "Susceptibility known" },
        { antibioticName: "Ciprofloxacin", doseText: "500 mg PO q12h", route: "PO", durationDaysRange: [5, 7], criteria: "Only if no Access option and risk factors" }
      ]),
      durationRulesJson: JSON.stringify({ uncomplicated: [5, 7], complicated: [7, 10], severe: [10, 14] }),
      redFlagsJson: JSON.stringify(["sepsis signs", "flank pain", "pregnancy with fever"]),
      sourceUrl: "https://www.who.int/publications/i/item/9789240062382"
    },
    {
      infectionKey: "uti_complicated",
      setting: "hospital",
      recommendedOptionsJson: JSON.stringify([
        { antibioticName: "Ceftriaxone", doseText: "1 g IV daily", route: "IV", durationDaysRange: [7, 10], criteria: "Complicated UTI needing admission" },
        { antibioticName: "Ciprofloxacin", doseText: "400 mg IV q12h then PO", route: "IV/PO", durationDaysRange: [7, 10], criteria: "Step-down when stable" },
        { antibioticName: "Nitrofurantoin", doseText: "100 mg PO q12h", route: "PO", durationDaysRange: [7, 7], criteria: "Lower tract only with susceptibility" }
      ]),
      durationRulesJson: JSON.stringify({ uncomplicated: [5, 7], complicated: [7, 10], severe: [10, 14] }),
      redFlagsJson: JSON.stringify(["obstruction", "AKI", "sepsis"]),
      sourceUrl: "https://aware.essentialmeds.org/"
    },
    {
      infectionKey: "cap_mild",
      setting: "primary_care",
      recommendedOptionsJson: JSON.stringify([
        { antibioticName: "Amoxicillin", doseText: "1 g PO q8h", route: "PO", durationDaysRange: [5, 7], criteria: "Mild CAP, low resistance risk" },
        { antibioticName: "Ceftriaxone", doseText: "1 g IV daily", route: "IV", durationDaysRange: [5, 7], criteria: "If admission/failed oral therapy" },
        { antibioticName: "Ciprofloxacin", doseText: "500 mg PO q12h", route: "PO", durationDaysRange: [5, 7], criteria: "Only if alternatives unsuitable" }
      ]),
      durationRulesJson: JSON.stringify({ uncomplicated: [5, 7], complicated: [7, 10], severe: [10, 14] }),
      redFlagsJson: JSON.stringify(["SpO2 <92%", "hemodynamic instability"]),
      sourceUrl: "https://www.who.int/publications/i/item/9789240062382"
    },
    {
      infectionKey: "cap_severe",
      setting: "hospital",
      recommendedOptionsJson: JSON.stringify([
        { antibioticName: "Ceftriaxone", doseText: "2 g IV daily", route: "IV", durationDaysRange: [7, 10], criteria: "Severe CAP initial therapy" },
        { antibioticName: "Amoxicillin", doseText: "1 g PO/IV q8h", route: "IV/PO", durationDaysRange: [7, 10], criteria: "Step-down if stable and susceptible" },
        { antibioticName: "Linezolid", doseText: "600 mg IV/PO q12h", route: "IV/PO", durationDaysRange: [10, 14], criteria: "Reserve for confirmed resistant gram-positive infection" }
      ]),
      durationRulesJson: JSON.stringify({ uncomplicated: [5, 7], complicated: [7, 10], severe: [10, 14] }),
      redFlagsJson: JSON.stringify(["shock", "ICU need"]),
      sourceUrl: "https://www.cdc.gov/antibiotic-use/hcp/core-elements/hospital.html"
    },
    {
      infectionKey: "ssti",
      setting: "hospital",
      recommendedOptionsJson: JSON.stringify([
        { antibioticName: "Amoxicillin", doseText: "500 mg PO q8h", route: "PO", durationDaysRange: [5, 7], criteria: "Mild non-purulent" },
        { antibioticName: "Ceftriaxone", doseText: "1 g IV daily", route: "IV", durationDaysRange: [5, 10], criteria: "Moderate systemic features" },
        { antibioticName: "Linezolid", doseText: "600 mg q12h", route: "IV/PO", durationDaysRange: [10, 14], criteria: "Confirmed MRSA with contraindications" }
      ]),
      durationRulesJson: JSON.stringify({ uncomplicated: [5, 7], complicated: [7, 10], severe: [10, 14] }),
      redFlagsJson: JSON.stringify(["necrotizing signs", "rapid progression"]),
      sourceUrl: "https://aware.essentialmeds.org/"
    }
  ] as const;

  for (const guide of guides) {
    await prisma.infectionGuide.create({ data: guide });
  }

  const demoCases = [
    { infection: "uti_uncomplicated", abx: "Nitrofurantoin", duration: 5, severity: "uncomplicated", overdueHours: 80 },
    { infection: "cap_mild", abx: "Ceftriaxone", duration: 7, severity: "complicated", overdueHours: 10 },
    { infection: "ssti", abx: "Amoxicillin", duration: 14, severity: "uncomplicated", overdueHours: 52 },
    { infection: "uti_complicated", abx: "Ciprofloxacin", duration: 7, severity: "complicated", overdueHours: 60 },
    { infection: "cap_severe", abx: "Amoxicillin", duration: 7, severity: "severe", overdueHours: 20 }
  ];

  for (const item of demoCases) {
    const createdCase = await prisma.case.create({
      data: {
        age: 54,
        sex: "female",
        pregnancy: false,
        allergiesText: "none",
        creatinineOrEgfr: "eGFR 70",
        setting: item.infection.includes("cap") && item.infection.includes("mild") ? "primary_care" : "hospital",
        suspectedInfectionKey: item.infection,
        severity: item.severity,
        symptomsText: "Synthetic seed case",
        chosenAntibiotic: item.abx,
        chosenDose: "seed dose",
        chosenDurationDays: item.duration,
        justificationText: "Synthetic demo"
      }
    });

    await prisma.recommendation.create({
      data: {
        caseId: createdCase.id,
        summaryText: "Synthetic seeded recommendation",
        suggestedRegimensJson: JSON.stringify([
          { antibioticName: item.abx, awareGroup: item.abx === "Linezolid" ? "RESERVE" : ["Ceftriaxone", "Ciprofloxacin"].includes(item.abx) ? "WATCH" : "ACCESS", doseText: "demo", durationDaysRange: [5, 7], route: "PO", criteria: "demo" }
        ]),
        awareWarningsJson: JSON.stringify(item.abx === "Nitrofurantoin" ? [] : ["Watch/Reserve chosen in seed case"]),
        durationWarningJson: JSON.stringify({ message: item.duration > 10 ? "Duration exceeds guideline" : "" }),
        reviewDueAt: subHours(new Date(), item.overdueHours),
        evidenceLinksJson: JSON.stringify([{ title: "WHO AWaRe", url: "https://aware.essentialmeds.org/", citation: "WHO AWaRe portal" }])
      }
    });

    await prisma.auditLog.create({ data: { caseId: createdCase.id, actionType: "SEEDED_CASE", detailJson: JSON.stringify({ note: "synthetic" }) } });
  }

  const metricRows = [
    { date: subDays(new Date(), 4), accessCount: 4, watchCount: 6, reserveCount: 1, totalCount: 11 },
    { date: subDays(new Date(), 3), accessCount: 6, watchCount: 5, reserveCount: 1, totalCount: 12 },
    { date: subDays(new Date(), 2), accessCount: 8, watchCount: 4, reserveCount: 1, totalCount: 13 },
    { date: subDays(new Date(), 1), accessCount: 9, watchCount: 3, reserveCount: 1, totalCount: 13 },
    { date: new Date(), accessCount: 10, watchCount: 3, reserveCount: 0, totalCount: 13 }
  ];

  for (const row of metricRows) {
    await prisma.metricDaily.create({ data: row });
  }

  console.log("Seed complete");
}

main().finally(async () => {
  await prisma.$disconnect();
});
