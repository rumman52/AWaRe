import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const antibiotics = [
  {
    name: "Nitrofurantoin",
    awareGroup: "ACCESS",
    adultDoseText: "100 mg PO q12h",
    renalAdjustmentText: "Avoid if eGFR <30",
    notes: "Uncomplicated lower UTI",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Amoxicillin",
    awareGroup: "ACCESS",
    adultDoseText: "500 mg PO q8h",
    renalAdjustmentText: "Adjust if severe impairment",
    notes: "CAP/SSTI if susceptible",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Ceftriaxone",
    awareGroup: "WATCH",
    adultDoseText: "1-2 g IV daily",
    renalAdjustmentText: "Usually no adjustment",
    notes: "Severe infection criteria",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Ciprofloxacin",
    awareGroup: "WATCH",
    adultDoseText: "500 mg PO q12h",
    renalAdjustmentText: "Reduce with low eGFR",
    notes: "Use with caution",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Linezolid",
    awareGroup: "RESERVE",
    adultDoseText: "600 mg IV/PO q12h",
    renalAdjustmentText: "Monitor prolonged use",
    notes: "MDR indications only",
    sourceUrl: "https://aware.essentialmeds.org/"
  }
] as const;

const guides = [
  {
    infectionKey: "uti_uncomplicated",
    setting: "primary_care",
    recommendedOptionsJson: JSON.stringify([
      {
        antibioticName: "Nitrofurantoin",
        doseText: "100 mg PO q12h",
        route: "PO",
        durationDaysRange: [5, 5],
        criteria: "No pyelonephritis signs"
      },
      {
        antibioticName: "Amoxicillin",
        doseText: "500 mg PO q8h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Susceptibility known"
      },
      {
        antibioticName: "Ciprofloxacin",
        doseText: "500 mg PO q12h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Only if no Access option and risk factors"
      }
    ]),
    durationRulesJson: JSON.stringify({ uncomplicated: [5, 7], complicated: [7, 10], severe: [10, 14] }),
    redFlagsJson: JSON.stringify(["sepsis signs", "flank pain", "pregnancy with fever"]),
    sourceUrl: "https://www.who.int/publications/i/item/9789240062382"
  },
  {
    infectionKey: "uti_complicated",
    setting: "hospital",
    recommendedOptionsJson: JSON.stringify([
      {
        antibioticName: "Ceftriaxone",
        doseText: "1 g IV daily",
        route: "IV",
        durationDaysRange: [7, 10],
        criteria: "Complicated UTI needing admission"
      },
      {
        antibioticName: "Ciprofloxacin",
        doseText: "400 mg IV/500 mg PO q12h",
        route: "IV/PO",
        durationDaysRange: [7, 10],
        criteria: "Step-down when stable"
      }
    ]),
    durationRulesJson: JSON.stringify({ uncomplicated: [5, 7], complicated: [7, 10], severe: [10, 14] }),
    redFlagsJson: JSON.stringify(["obstruction", "AKI", "sepsis"]),
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    infectionKey: "cap_mild",
    setting: "primary_care",
    recommendedOptionsJson: JSON.stringify([
      {
        antibioticName: "Amoxicillin",
        doseText: "1 g PO q8h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Mild CAP, low resistance risk"
      },
      {
        antibioticName: "Ceftriaxone",
        doseText: "1 g IV daily",
        route: "IV",
        durationDaysRange: [5, 7],
        criteria: "If admission/failed oral therapy"
      }
    ]),
    durationRulesJson: JSON.stringify({ uncomplicated: [5, 7], complicated: [7, 10], severe: [10, 14] }),
    redFlagsJson: JSON.stringify(["SpO2 <92%", "hemodynamic instability"]),
    sourceUrl: "https://www.who.int/publications/i/item/9789240062382"
  },
  {
    infectionKey: "cap_severe",
    setting: "hospital",
    recommendedOptionsJson: JSON.stringify([
      {
        antibioticName: "Ceftriaxone",
        doseText: "2 g IV daily",
        route: "IV",
        durationDaysRange: [7, 10],
        criteria: "Severe CAP initial therapy"
      },
      {
        antibioticName: "Linezolid",
        doseText: "600 mg IV/PO q12h",
        route: "IV/PO",
        durationDaysRange: [10, 14],
        criteria: "Reserve for confirmed resistant gram-positive infection"
      }
    ]),
    durationRulesJson: JSON.stringify({ uncomplicated: [5, 7], complicated: [7, 10], severe: [10, 14] }),
    redFlagsJson: JSON.stringify(["shock", "ICU need"]),
    sourceUrl: "https://www.cdc.gov/antibiotic-use/hcp/core-elements/hospital.html"
  },
  {
    infectionKey: "ssti",
    setting: "hospital",
    recommendedOptionsJson: JSON.stringify([
      {
        antibioticName: "Amoxicillin",
        doseText: "500 mg PO q8h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Mild non-purulent"
      },
      {
        antibioticName: "Ceftriaxone",
        doseText: "1 g IV daily",
        route: "IV",
        durationDaysRange: [5, 10],
        criteria: "Moderate systemic features"
      }
    ]),
    durationRulesJson: JSON.stringify({ uncomplicated: [5, 7], complicated: [7, 10], severe: [10, 14] }),
    redFlagsJson: JSON.stringify(["necrotizing signs", "rapid progression"]),
    sourceUrl: "https://aware.essentialmeds.org/"
  }
] as const;

async function main() {
  for (const antibiotic of antibiotics) {
    await prisma.antibiotic.upsert({
      where: { name: antibiotic.name },
      update: antibiotic,
      create: antibiotic
    });
  }

  for (const guide of guides) {
    await prisma.infectionGuide.upsert({
      where: {
        infectionKey_setting: {
          infectionKey: guide.infectionKey,
          setting: guide.setting
        }
      },
      update: guide,
      create: guide
    });
  }

  console.log("Seed complete: Antibiotic and InfectionGuide records are up to date.");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
