import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const antibiotics = [
  {
    name: "Nitrofurantoin",
    awareGroup: "ACCESS",
    adultDoseText: "100 mg PO q12h",
    renalAdjustmentText: "Avoid if eGFR <30 mL/min/1.73m²",
    notes: "Preferred for uncomplicated lower UTI when appropriate",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Amoxicillin",
    awareGroup: "ACCESS",
    adultDoseText: "1 g PO q8h",
    renalAdjustmentText: "Adjust interval in severe renal impairment",
    notes: "Option for susceptible respiratory and skin infections",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Cephalexin",
    awareGroup: "ACCESS",
    adultDoseText: "500 mg PO q6-8h",
    renalAdjustmentText: "Adjust dose/interval when eGFR is reduced",
    notes: "Common oral option for mild skin/soft tissue infections",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Doxycycline",
    awareGroup: "ACCESS",
    adultDoseText: "100 mg PO q12h",
    renalAdjustmentText: "No adjustment usually required",
    notes: "Consider based on local epidemiology and contraindications",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Ceftriaxone",
    awareGroup: "WATCH",
    adultDoseText: "1-2 g IV q24h",
    renalAdjustmentText: "Usually no renal adjustment",
    notes: "Reserve for criteria indicating broader-spectrum/parenteral need",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Ciprofloxacin",
    awareGroup: "WATCH",
    adultDoseText: "500 mg PO q12h",
    renalAdjustmentText: "Reduce dose/extend interval in renal impairment",
    notes: "Use only when indicated and Access options are unsuitable",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Linezolid",
    awareGroup: "RESERVE",
    adultDoseText: "600 mg IV/PO q12h",
    renalAdjustmentText: "No routine adjustment; monitor prolonged use",
    notes: "Reserve for confirmed/suspected MDR gram-positive infections",
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
        criteria: "No systemic signs or pyelonephritis concerns"
      },
      {
        antibioticName: "Amoxicillin",
        doseText: "500 mg PO q8h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Only if susceptibility known/likely"
      },
      {
        antibioticName: "Ciprofloxacin",
        doseText: "500 mg PO q12h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Use only if Access options are not appropriate"
      }
    ]),
    durationRulesJson: JSON.stringify({ uncomplicated: [5, 7], complicated: [7, 10], severe: [10, 14] }),
    redFlagsJson: JSON.stringify(["fever with flank pain", "sepsis signs", "pregnancy with systemic symptoms"]),
    sourceUrl: "https://www.who.int/publications/i/item/9789240062382"
  },
  {
    infectionKey: "pneumonia_mild",
    setting: "primary_care",
    recommendedOptionsJson: JSON.stringify([
      {
        antibioticName: "Amoxicillin",
        doseText: "1 g PO q8h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Mild CAP without admission criteria"
      },
      {
        antibioticName: "Doxycycline",
        doseText: "100 mg PO q12h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Alternative based on local guidance and contraindications"
      },
      {
        antibioticName: "Ceftriaxone",
        doseText: "1 g IV q24h",
        route: "IV",
        durationDaysRange: [5, 7],
        criteria: "If escalated care/admission becomes necessary"
      }
    ]),
    durationRulesJson: JSON.stringify({ uncomplicated: [5, 7], complicated: [7, 10], severe: [10, 14] }),
    redFlagsJson: JSON.stringify(["SpO2 <92%", "hemodynamic instability", "confusion or inability to take oral therapy"]),
    sourceUrl: "https://www.who.int/publications/i/item/9789240062382"
  },
  {
    infectionKey: "skin_soft_tissue_mild",
    setting: "primary_care",
    recommendedOptionsJson: JSON.stringify([
      {
        antibioticName: "Cephalexin",
        doseText: "500 mg PO q6-8h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Mild non-purulent SSTI"
      },
      {
        antibioticName: "Amoxicillin",
        doseText: "500 mg PO q8h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "If local susceptibility supports use"
      },
      {
        antibioticName: "Ceftriaxone",
        doseText: "1 g IV q24h",
        route: "IV",
        durationDaysRange: [5, 10],
        criteria: "Escalate if systemic features or oral therapy not feasible"
      }
    ]),
    durationRulesJson: JSON.stringify({ uncomplicated: [5, 7], complicated: [7, 10], severe: [10, 14] }),
    redFlagsJson: JSON.stringify(["rapid progression", "necrotizing signs", "systemic toxicity"]),
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

  console.log(`Seed complete: upserted ${antibiotics.length} antibiotics and ${guides.length} infection guides.`);
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
