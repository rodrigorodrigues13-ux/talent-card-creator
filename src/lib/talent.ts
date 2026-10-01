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
  status: string;
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
    status: c(9),
    talentFactory: c(10),
    c200: c(11),
    manager: c(12),
    timeInRole: c(13),
    timeInCompany: c(14),
    box2025: c(15),
    box2026: c(16),
    riskOfLoss: c(17),
    criticality: c(18),
    successionImmediate: c(19),
    successionShort: c(20),
    successionMedium: c(21),
    successionLong: c(22),
    langAdvanced: c(23),
    langIntermediate: c(24),
    langBasic: c(25),
    nationalMobility: c(26),
    internationalMobility: c(27),
    successorsShort: c(28),
    successorsMedium: c(29),
    successorsLong: c(30),
    careerHistory: list(row[31]),
    education: list(row[32]),
    competencies: list(row[33]),
    development: list(row[34]),
    readiness: list(row[35]),
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
  const hasStatus = headers.some((h) => h === "Status");
  const hasImmediateSuccessor = headers.some((h) => h === "Successors - Immediate");
  return rows
    .slice(1)
    .filter((r) => r.some((cell) => clean(cell) !== ""))
    .map((row, index) => {
      const normalized = [...row];
      if (!hasNewFields) normalized.splice(3, 0, "", "", "", "");
      if (hasImmediateSuccessor) normalized.splice(27, 1);
      if (!hasStatus) normalized.splice(9, 0, "");
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
