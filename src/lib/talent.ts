import * as XLSX from "xlsx";

/**
 * Column order matches both language variants of the exported Excel template.
 */
export type Talent = {
  id: string;
  name: string;
  level: string;
  gender: string;
  expatriate: string;
  originCountry: string;
  expatriationEndDate: string;
  businessLine: string;
  age: string;
  jobTitle: string;
  talentFactory: string;
  c200: string;
  manager: string;
  timeInRole: string;
  timeInCompany: string;
  box2025: string;
  box2026: string;
  riskOfLoss: string;
  criticality: string;
  successionImmediate: string;
  successionShort: string;
  successionMedium: string;
  successionLong: string;
  langAdvanced: string;
  langIntermediate: string;
  langBasic: string;
  nationalMobility: string;
  internationalMobility: string;
  successorsShort: string;
  successorsMedium: string;
  successorsLong: string;
  careerHistory: string[];
  education: string[];
  competencies: string[];
  development: string[];
  readiness: string[];
};

const clean = (v: unknown) => (v == null ? "" : String(v).trim());
const list = (v: unknown) =>
  clean(v)
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

export function rowToTalent(row: unknown[], index: number): Talent {
  const c = (i: number) => clean(row[i]);
  return {
    id: `${index}-${c(0) || "row"}`,
    name: c(0),
    level: c(1),
    gender: c(2),
    expatriate: c(3),
    originCountry: c(4),
    expatriationEndDate: c(5),
    businessLine: c(6),
    age: c(7),
    jobTitle: c(8),
    talentFactory: c(9),
    c200: c(10),
    manager: c(11),
    timeInRole: c(12),
    timeInCompany: c(13),
    box2025: c(14),
    box2026: c(15),
    riskOfLoss: c(16),
    criticality: c(17),
    successionImmediate: c(18),
    successionShort: c(19),
    successionMedium: c(20),
    successionLong: c(21),
    langAdvanced: c(22),
    langIntermediate: c(23),
    langBasic: c(24),
    nationalMobility: c(25),
    internationalMobility: c(26),
    successorsShort: c(27),
    successorsMedium: c(28),
    successorsLong: c(29),
    careerHistory: list(row[30]),
    education: list(row[31]),
    competencies: list(row[32]),
    development: list(row[33]),
    readiness: list(row[34]),
  };
}

export async function parseWorkbook(file: File): Promise<Talent[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const first = wb.SheetNames[0];
  const sheet = first ? wb.Sheets[first] : undefined;
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  const headers = (rows[0] ?? []).map(clean);
  const hasNewFields = headers.some((h) => /^(Expatriado|Expatriate)/i.test(h));
  const hasImmediateSuccessor = headers.some((h) => h === "Successors - Immediate");
  return rows
    .slice(1)
    .filter((r) => r.some((cell) => clean(cell) !== ""))
    .map((row, index) => {
      const normalized = [...row];
      if (!hasNewFields) normalized.splice(3, 0, "", "", "", "");
      if (hasImmediateSuccessor) normalized.splice(27, 1);
      return rowToTalent(normalized, index);
    });
}

/** The template is a pre-built file (dropdown validations need openpyxl). */
export function downloadTemplate(lang: "en" | "pt") {
  const a = document.createElement("a");
  const name = lang === "en" ? "talent-card-template-en.xlsx" : "talent-card-template.xlsx";
  a.href = `/${name}?v=${Date.now()}`;
  a.download = name;
  a.click();
}
