import { addHours } from "date-fns";
import { DurationRules, EvidenceLink, RegimenOption } from "./types";

type AntibioticLike = {
  name: string;
  awareGroup: string;
  renalAdjustmentText: string;
  notes: string;
};

type InfectionGuideLike = {
  recommendedOptionsJson: string;
  durationRulesJson: string;
};

export function generateRecommendation(input: {
  guide: InfectionGuideLike;
  antibiotics: AntibioticLike[];
  severity: string;
  chosenAntibiotic?: string;
  chosenDurationDays?: number;
}) {
  const options = JSON.parse(input.guide.recommendedOptionsJson) as RegimenOption[];
  const durationRules = JSON.parse(input.guide.durationRulesJson) as DurationRules;

  const suggested = options.slice(0, 3).map((option) => {
    const abx = input.antibiotics.find((a) => a.name === option.antibioticName);
    return {
      ...option,
      awareGroup: abx?.awareGroup ?? "WATCH",
      renalAdjustmentText: abx?.renalAdjustmentText ?? "Check local renal dosing protocol",
      notes: abx?.notes ?? ""
    };
  });

  const warnings: string[] = [];
  if (input.chosenAntibiotic) {
    const chosen = input.antibiotics.find((a) => a.name === input.chosenAntibiotic);
    if (chosen && (chosen.awareGroup === "WATCH" || chosen.awareGroup === "RESERVE")) {
      const accessAlternatives = suggested.filter((s) => s.awareGroup === "ACCESS").map((s) => s.antibioticName);
      warnings.push(
        `${chosen.name} is ${chosen.awareGroup}. Confirm criteria and microbiology risk; consider Access alternatives: ${
          accessAlternatives.length ? accessAlternatives.join(", ") : "none listed"
        }.`
      );
    }
  }

  let durationWarning = "";
  const range =
    input.severity === "severe"
      ? durationRules.severe
      : input.severity === "complicated"
        ? durationRules.complicated
        : durationRules.uncomplicated;
  if (input.chosenDurationDays && input.chosenDurationDays > range[1]) {
    durationWarning = `Selected duration (${input.chosenDurationDays} days) exceeds guide range ${range[0]}-${range[1]} days.`;
  }

  const reviewDueAt = addHours(new Date(), input.severity === "severe" ? 72 : 48);

  const evidenceLinks: EvidenceLink[] = [
    {
      title: "WHO AWaRe Antibiotic Book",
      url: "https://www.who.int/publications/i/item/9789240062382",
      citation: "WHO AWaRe Antibiotic Book (2022)"
    },
    {
      title: "WHO AWaRe portal",
      url: "https://aware.essentialmeds.org/",
      citation: "WHO AWaRe portal"
    },
    {
      title: "CDC Core Elements",
      url: "https://www.cdc.gov/antibiotic-use/hcp/core-elements/hospital.html",
      citation: "CDC Core Elements of Hospital ASP"
    }
  ];

  return {
    summaryText:
      "Guideline-aligned options prioritize narrowest effective spectrum first, include dose/duration checks, and require clinician confirmation.",
    suggested,
    warnings,
    durationWarning,
    reviewDueAt,
    evidenceLinks
  };
}

export function renderRationale(params: { infection: string; severity: string; options: string[]; llmText?: string }) {
  if (params.llmText) return params.llmText;
  return `For ${params.infection} (${params.severity}), prioritize listed AWaRe-aligned regimens in order of narrowest effective spectrum, verify local susceptibility/allergy/renal status, and reassess at 48-72 hours for de-escalation.`;
}
