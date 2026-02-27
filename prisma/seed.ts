import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const antibiotics = [
  {
    name: "Nitrofurantoin",
    awareGroup: "ACCESS",
    adultDoseText: "100 mg PO q12h",
    renalAdjustmentText: "Avoid if eGFR <30 mL/min/1.73m²",
    notes: "Preferred for uncomplicated lower UTI when appropriate.",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Amoxicillin",
    awareGroup: "ACCESS",
    adultDoseText: "1 g PO q8h",
    renalAdjustmentText: "Adjust interval in severe renal impairment.",
    notes: "Option for susceptible respiratory and skin infections.",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Cephalexin",
    awareGroup: "ACCESS",
    adultDoseText: "500 mg PO q6-8h",
    renalAdjustmentText: "Adjust dose/interval when eGFR is reduced.",
    notes: "Common oral option for mild skin/soft tissue infections.",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Doxycycline",
    awareGroup: "ACCESS",
    adultDoseText: "100 mg PO q12h",
    renalAdjustmentText: "No adjustment usually required.",
    notes: "Consider based on local epidemiology and contraindications.",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Ceftriaxone",
    awareGroup: "WATCH",
    adultDoseText: "1-2 g IV q24h",
    renalAdjustmentText: "Usually no renal adjustment.",
    notes: "Use for indications requiring broader-spectrum or parenteral therapy.",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Ciprofloxacin",
    awareGroup: "WATCH",
    adultDoseText: "500 mg PO q12h",
    renalAdjustmentText: "Reduce dose/extend interval in renal impairment.",
    notes: "Use only when Access options are unsuitable.",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Piperacillin-tazobactam",
    awareGroup: "WATCH",
    adultDoseText: "4.5 g IV q6-8h",
    renalAdjustmentText: "Adjust in moderate-to-severe renal impairment.",
    notes: "Broad-spectrum hospital option when severe infection criteria are present.",
    sourceUrl: "https://aware.essentialmeds.org/"
  },
  {
    name: "Linezolid",
    awareGroup: "RESERVE",
    adultDoseText: "600 mg IV/PO q12h",
    renalAdjustmentText: "No routine adjustment; monitor prolonged use.",
    notes: "Reserve for confirmed/suspected multidrug-resistant gram-positive infections.",
    sourceUrl: "https://aware.essentialmeds.org/"
  }
] as const;

const defaultDurationRules = JSON.stringify({
  uncomplicated: [5, 7],
  complicated: [7, 10],
  severe: [10, 14]
});

function createGuide(input: {
  infectionKey: string;
  setting: "primary_care" | "hospital";
  options: Array<{
    antibioticName: string;
    doseText: string;
    route: "PO" | "IV";
    durationDaysRange: [number, number];
    criteria: string;
  }>;
  redFlags: string[];
  sourceUrl?: string;
}) {
  return {
    infectionKey: input.infectionKey,
    setting: input.setting,
    recommendedOptionsJson: JSON.stringify(input.options),
    durationRulesJson: defaultDurationRules,
    redFlagsJson: JSON.stringify(input.redFlags),
    sourceUrl: input.sourceUrl ?? "https://www.who.int/publications/i/item/9789240062382"
  };
}

const guides = [
  createGuide({
    infectionKey: "uti_uncomplicated",
    setting: "primary_care",
    options: [
      {
        antibioticName: "Nitrofurantoin",
        doseText: "100 mg PO q12h",
        route: "PO",
        durationDaysRange: [5, 5],
        criteria: "No systemic signs or pyelonephritis concerns."
      },
      {
        antibioticName: "Amoxicillin",
        doseText: "500 mg PO q8h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Only if susceptibility is known/likely."
      },
      {
        antibioticName: "Ciprofloxacin",
        doseText: "500 mg PO q12h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Use only if Access options are not appropriate."
      }
    ],
    redFlags: ["fever with flank pain", "sepsis signs", "pregnancy with systemic symptoms"]
  }),
  createGuide({
    infectionKey: "uti_complicated",
    setting: "primary_care",
    options: [
      {
        antibioticName: "Ciprofloxacin",
        doseText: "500 mg PO q12h",
        route: "PO",
        durationDaysRange: [7, 10],
        criteria: "Complicated host factors with stable outpatient follow-up."
      },
      {
        antibioticName: "Amoxicillin",
        doseText: "1 g PO q8h",
        route: "PO",
        durationDaysRange: [7, 10],
        criteria: "If pathogen susceptibility is available."
      },
      {
        antibioticName: "Ceftriaxone",
        doseText: "1 g IV q24h",
        route: "IV",
        durationDaysRange: [7, 10],
        criteria: "Escalate to IV or referral for worsening clinical status."
      }
    ],
    redFlags: ["obstruction concern", "persistent vomiting", "hypotension"]
  }),
  createGuide({
    infectionKey: "cap_mild",
    setting: "primary_care",
    options: [
      {
        antibioticName: "Amoxicillin",
        doseText: "1 g PO q8h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Mild CAP without admission criteria."
      },
      {
        antibioticName: "Doxycycline",
        doseText: "100 mg PO q12h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Alternative based on local guidance and contraindications."
      },
      {
        antibioticName: "Ceftriaxone",
        doseText: "1 g IV q24h",
        route: "IV",
        durationDaysRange: [5, 7],
        criteria: "If escalation/admission becomes necessary."
      }
    ],
    redFlags: ["SpO2 <92%", "hemodynamic instability", "inability to take oral therapy"]
  }),
  createGuide({
    infectionKey: "cap_severe",
    setting: "primary_care",
    options: [
      {
        antibioticName: "Ceftriaxone",
        doseText: "2 g IV q24h",
        route: "IV",
        durationDaysRange: [7, 10],
        criteria: "Urgent referral/severe CAP criteria."
      },
      {
        antibioticName: "Piperacillin-tazobactam",
        doseText: "4.5 g IV q6-8h",
        route: "IV",
        durationDaysRange: [7, 10],
        criteria: "Higher-risk hospital-level management."
      },
      {
        antibioticName: "Linezolid",
        doseText: "600 mg IV/PO q12h",
        route: "IV",
        durationDaysRange: [7, 14],
        criteria: "Reserve for suspected resistant gram-positive pathogens."
      }
    ],
    redFlags: ["respiratory failure", "shock", "altered mental status"]
  }),
  createGuide({
    infectionKey: "ssti",
    setting: "primary_care",
    options: [
      {
        antibioticName: "Cephalexin",
        doseText: "500 mg PO q6-8h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Mild non-purulent SSTI."
      },
      {
        antibioticName: "Amoxicillin",
        doseText: "500 mg PO q8h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "If local susceptibility supports use."
      },
      {
        antibioticName: "Ceftriaxone",
        doseText: "1 g IV q24h",
        route: "IV",
        durationDaysRange: [5, 10],
        criteria: "Escalate if systemic features or oral therapy not feasible."
      }
    ],
    redFlags: ["rapid progression", "necrotizing signs", "systemic toxicity"]
  }),
  createGuide({
    infectionKey: "uti_uncomplicated",
    setting: "hospital",
    options: [
      {
        antibioticName: "Nitrofurantoin",
        doseText: "100 mg PO q12h",
        route: "PO",
        durationDaysRange: [5, 5],
        criteria: "Stable lower UTI without pyelonephritis features."
      },
      {
        antibioticName: "Ceftriaxone",
        doseText: "1 g IV q24h",
        route: "IV",
        durationDaysRange: [5, 7],
        criteria: "If oral therapy is not tolerated."
      },
      {
        antibioticName: "Ciprofloxacin",
        doseText: "500 mg PO q12h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Use only with clear indication and risk-benefit review."
      }
    ],
    redFlags: ["catheter-associated risk", "bacteremia concern", "hemodynamic instability"]
  }),
  createGuide({
    infectionKey: "uti_complicated",
    setting: "hospital",
    options: [
      {
        antibioticName: "Ceftriaxone",
        doseText: "1-2 g IV q24h",
        route: "IV",
        durationDaysRange: [7, 10],
        criteria: "First-line inpatient option pending cultures."
      },
      {
        antibioticName: "Piperacillin-tazobactam",
        doseText: "4.5 g IV q6-8h",
        route: "IV",
        durationDaysRange: [7, 10],
        criteria: "For severe illness or broader gram-negative risk."
      },
      {
        antibioticName: "Linezolid",
        doseText: "600 mg IV/PO q12h",
        route: "IV",
        durationDaysRange: [7, 14],
        criteria: "Reserve for resistant gram-positive concern."
      }
    ],
    redFlags: ["urologic obstruction", "septic shock", "AKI progression"]
  }),
  createGuide({
    infectionKey: "cap_mild",
    setting: "hospital",
    options: [
      {
        antibioticName: "Amoxicillin",
        doseText: "1 g PO q8h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Low-severity CAP with oral therapy tolerated."
      },
      {
        antibioticName: "Ceftriaxone",
        doseText: "1 g IV q24h",
        route: "IV",
        durationDaysRange: [5, 7],
        criteria: "If IV therapy is indicated."
      },
      {
        antibioticName: "Doxycycline",
        doseText: "100 mg PO q12h",
        route: "PO",
        durationDaysRange: [5, 7],
        criteria: "Alternative where appropriate."
      }
    ],
    redFlags: ["respiratory distress", "new confusion", "hypotension"]
  }),
  createGuide({
    infectionKey: "cap_severe",
    setting: "hospital",
    options: [
      {
        antibioticName: "Ceftriaxone",
        doseText: "2 g IV q24h",
        route: "IV",
        durationDaysRange: [7, 10],
        criteria: "Severe CAP initial inpatient option."
      },
      {
        antibioticName: "Piperacillin-tazobactam",
        doseText: "4.5 g IV q6-8h",
        route: "IV",
        durationDaysRange: [7, 10],
        criteria: "Broad-spectrum coverage for severe presentations."
      },
      {
        antibioticName: "Linezolid",
        doseText: "600 mg IV/PO q12h",
        route: "IV",
        durationDaysRange: [7, 14],
        criteria: "Reserve when resistant gram-positive coverage is needed."
      }
    ],
    redFlags: ["mechanical ventilation need", "septic shock", "ICU transfer"]
  }),
  createGuide({
    infectionKey: "ssti",
    setting: "hospital",
    options: [
      {
        antibioticName: "Ceftriaxone",
        doseText: "1-2 g IV q24h",
        route: "IV",
        durationDaysRange: [5, 10],
        criteria: "Moderate SSTI requiring inpatient IV therapy."
      },
      {
        antibioticName: "Piperacillin-tazobactam",
        doseText: "4.5 g IV q6-8h",
        route: "IV",
        durationDaysRange: [7, 10],
        criteria: "Severe polymicrobial or healthcare-associated risk."
      },
      {
        antibioticName: "Linezolid",
        doseText: "600 mg IV/PO q12h",
        route: "IV",
        durationDaysRange: [7, 14],
        criteria: "Reserve for suspected resistant gram-positive infection."
      }
    ],
    redFlags: ["necrotizing signs", "rapid spread", "hemodynamic instability"]
  })
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
