export type RegimenOption = {
  antibioticName: string;
  doseText: string;
  route: string;
  durationDaysRange: [number, number];
  criteria: string;
};

export type DurationRules = {
  uncomplicated: [number, number];
  complicated: [number, number];
  severe: [number, number];
};

export type EvidenceLink = {
  title: string;
  url: string;
  citation: string;
};
