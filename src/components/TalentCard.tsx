import { useRef } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import type { Talent } from "@/lib/talent";
import { dict, type Dict } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** 9-box quadrants, matching the company's matrix image. */
const BOX_QUADRANTS = [
  { key: "uw", code: "UW", label: "Under Watching", sub: "TO EVALUATE", bg: "bg-[var(--box-orange)]", span: "row-span-2" },
  { key: "tt", code: "TT", label: "Top Talents", sub: "TO ACCELERATE", bg: "bg-[var(--box-green)]", span: "" },
  { key: "kp", code: "KP", label: "Key Players", sub: "TO DEVELOP", bg: "bg-[var(--box-blue)]", span: "" },
  { key: "mc", code: "MC", label: "Moderate Contributors", sub: "TO ACTION", bg: "bg-[var(--box-red)]", span: "" },
  { key: "sp", code: "SP", label: "Strong Professionals", sub: "TO LEVERAGE", bg: "bg-[var(--box-navy)]", span: "" },
] as const;

function matchQuadrant(value: string): string {
  const v = value.trim().toLowerCase();
  if (!v) return "";
  if (v.includes("under watching") || v === "uw" || v === "yellow") return "uw";
  if (v.includes("moderate") || v === "mc" || v === "orange") return "mc";
  if (v.includes("top talents") || v === "tt" || v === "green") return "tt";
  if (v.includes("key players") || v === "kp" || v === "teal") return "kp";
  if (v.includes("strong professionals") || v === "sp" || v === "blue") return "sp";
  return "";
}

/** "High ( x )" / "Medium (  )" style option. */
function Option({ label, checked, nowrap }: { label: string; checked: boolean; nowrap?: boolean }) {
  return (
    <div className={cn("text-[11px] leading-5 text-[var(--tc-ink)]", nowrap && "whitespace-nowrap tracking-tight")}>
      {label} <span className="font-semibold">({checked ? " x " : "   "})</span>
    </div>
  );
}

const LEVEL_ALIASES: Record<string, string[]> = {
  high: ["high", "alto", "alta"],
  medium: ["medium", "médio", "medio", "média", "media"],
  low: ["low", "baixo", "baixa"],
};

function matches(value: string, option: string) {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  const aliases = LEVEL_ALIASES[option.toLowerCase()] ?? [option.toLowerCase()];
  return aliases.some((a) => v === a || v.startsWith(a.slice(0, 3)));
}

const READINESS_KEYS = [
  "readinessStrategic",
  "readinessExpatriation",
  "readinessScope",
  "readinessRotation",
  "readinessMentoring",
  "readinessLeadership",
  "readinessOthers",
] as const;

function readinessChecked(values: string[], key: (typeof READINESS_KEYS)[number]) {
  const labels = [dict.en[key], dict.pt[key]].map((s) => s.toLowerCase());
  return values.some((r) => {
    const rv = r.toLowerCase();
    return labels.some(
      (l) => rv.includes(l.split(" ")[0]!) || l.includes(rv.split(" ")[0]!),
    );
  });
}

function yesNo(value: string) {
  const v = value.trim().toUpperCase();
  return { yes: v.startsWith("Y") || v.startsWith("S"), no: v.startsWith("N") };
}

function translateIdCriteria(value: string, t: Dict) {
  const v = value.trim().toLowerCase();
  if (!v) return "";
  if (v.startsWith("tt")) return "TT N-1 Comex";
  if (v.startsWith("succ") || v.startsWith("plano")) return t.idCritSucc;
  if (v.startsWith("expat")) return t.idCritExpat;
  if (v.startsWith("other") || v.startsWith("outr")) return t.idCritOther;
  return value;
}

function YesNo({ label, value }: { label: string; value: string }) {
  const { yes, no } = yesNo(value);
  return (
    <div className="text-[11px] leading-5 text-[var(--tc-ink)]">
      {label}: Y<span className="font-semibold">({yes ? "x" : " "})</span> N
      <span className="font-semibold">({no ? "x" : " "})</span>
    </div>
  );
}

function NineBox({ year, value }: { year: string; value: string }) {
  const selected = matchQuadrant(value);
  // Image layout: left column UW (tall) over MC; right column TT / KP / SP.
  const order = [
    BOX_QUADRANTS[0]!, // uw — row-span-2 (left, tall)
    BOX_QUADRANTS[1]!, // tt (right top)
    BOX_QUADRANTS[2]!, // kp (right middle)
    BOX_QUADRANTS[3]!, // mc (left bottom)
    BOX_QUADRANTS[4]!, // sp (right bottom)
  ];
  return (
    <div className="text-center">
      <div className="mb-1 text-[11px] font-semibold text-[var(--tc-ink)]/80">{year}</div>
      <div className="grid w-[200px] grid-cols-2 grid-rows-3 gap-px overflow-hidden rounded-[3px] border border-[var(--tc-surface)] bg-[var(--tc-surface)]">
        {order.map((q) => (
          <div
            key={q.key}
            className={cn(
              "relative flex min-h-[34px] flex-col items-center justify-center px-1 py-1",
              q.bg,
              q.span,
            )}
          >
            {selected === q.key ? (
              <span className="rounded-[2px] bg-[var(--tc-surface)] px-2 py-0.5 text-sm font-bold text-[var(--tc-ink)]">
                X
              </span>
            ) : null}

          </div>
        ))}
      </div>
    </div>
  );
}

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-center text-[11px] font-bold uppercase leading-tight tracking-wide text-[var(--tc-highlight)]">
      {children}
    </h3>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[11px] leading-5 text-[var(--tc-ink)]">
      <span>{label}:</span> {value ? <span>{value}</span> : null}
    </div>
  );
}

export function TalentCard({
  talent,
  t,
  photoOverride,
  onPhotoChange,
}: {
  talent: Talent;
  t: Dict;
  photoOverride?: string | undefined;
  onPhotoChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Photos are only added via the on-card upload (data URLs), so they always
  // render and can be captured into the PDF.
  const photo = photoOverride ?? "";

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  const readinessOptions = [
    t.readinessStrategic,
    t.readinessExpatriation,
    t.readinessScope,
    t.readinessRotation,
    t.readinessMentoring,
    t.readinessLeadership,
    t.readinessOthers,
  ];

  return (
    <article className="w-[1100px] bg-card text-[var(--tc-ink)] shadow-sm">
      {/* Header with gradient */}
      <div className="relative flex items-center gap-6 bg-[var(--tc-surface)] px-6 py-5">
        <div className="relative shrink-0">
          <div className="flex size-[104px] items-center justify-center overflow-hidden rounded-full bg-secondary">
            {photo ? (
              <img src={photo} alt={talent.name} className="size-full object-cover" />
            ) : (
              <span className="px-2 text-center text-[11px] text-muted-foreground">
                {talent.name}
              </span>
            )}
          </div>
          <button
            type="button"
            data-pdf-hide
            onClick={() => inputRef.current?.click()}
            className="absolute -bottom-1 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-[var(--tc-highlight)] px-2.5 py-1 text-[10px] font-semibold text-[var(--tc-surface)] shadow"
          >
            {photo ? <Camera className="size-3" /> : <ImagePlus className="size-3" />}
            {photo ? t.changePhoto : t.addPhoto}
          </button>
          {photo ? (
            <button
              type="button"
              data-pdf-hide
              onClick={() => onPhotoChange(null)}
              className="absolute -right-1 -top-1 inline-flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
              aria-label={t.removePhoto}
            >
              <Trash2 className="size-3" />
            </button>
          ) : null}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        <div className="w-[280px] shrink-0">
          <h2 className="text-xl font-bold uppercase leading-tight">{talent.name}</h2>
          <p className="text-xl font-bold leading-tight">{talent.level}</p>
          <div className="mt-2 space-y-0.5 text-[11px]">
            <div>
              {t.gender}: {talent.gender}
            </div>
            <YesNo label={t.expatriate} value={talent.expatriate} />
            <div>{t.originCountry}: {talent.originCountry}</div>
            <div>{t.expatriationEndDate}: {talent.expatriationEndDate}</div>
            <div>{t.businessLine}: {talent.businessLine}</div>
            <div>
              {t.age}: {talent.age}
            </div>
            <div>
              {t.jobTitle}: {talent.jobTitle}
            </div>
            <div>
              {t.status}: {talent.status}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-1 text-[11px]">
          <YesNo label={t.c200} value={talent.c200} />
          <YesNo label={t.talentFactory} value={talent.talentFactory} />
          <div>
            {t.manager}: {talent.manager}
          </div>
          <div>
            {t.timeInRole}: {talent.timeInRole}
          </div>
          <div>
            {t.timeInCompany}: {talent.timeInCompany}
          </div>
          <div>
            {t.idCriteria}: {translateIdCriteria(talent.idCriteria, t)}
          </div>
        </div>

        <div className="flex shrink-0 gap-6 pr-2">
          <NineBox year="2025" value={talent.box2025} />
          <NineBox year="2026" value={talent.box2026} />
        </div>
      </div>

      {/* Middle framed block */}
      <div className="mx-6 mt-4 rounded-md border border-[var(--tc-highlight)]">
        <div className="grid grid-cols-5 border-b border-[var(--tc-highlight)]">
          {[t.riskOfLoss, t.succession, t.languages, t.mobility, t.potentialSuccessors].map((h) => (
            <div key={h} className="px-3 py-2">
              <ColumnTitle>{h}</ColumnTitle>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5">
          <div className="space-y-0.5 px-3 py-3">
            <Option label={t.high} checked={matches(talent.riskOfLoss, "high")} />
            <Option label={t.medium} checked={matches(talent.riskOfLoss, "medium")} />
            <Option label={t.low} checked={matches(talent.riskOfLoss, "low")} />
          </div>
          <div className="space-y-0.5 px-3 py-3">
            <Line label={t.immediate} value={talent.successionImmediate} />
            <Line label={t.shortTerm} value={talent.successionShort} />
            <Line label={t.mediumTerm} value={talent.successionMedium} />
            <Line label={t.longTerm} value={talent.successionLong} />
          </div>
          <div className="space-y-0.5 px-3 py-3">
            <Line label={t.advanced} value={talent.langAdvanced} />
            <Line label={t.intermediate} value={talent.langIntermediate} />
            <Line label={t.basic} value={talent.langBasic} />
          </div>
          <div className="space-y-0.5 px-3 py-3">
            <YesNo label={t.national} value={talent.nationalMobility} />
            <YesNo label={t.international} value={talent.internationalMobility} />
          </div>
          <div className="space-y-0.5 px-3 py-3">
            <Line label={t.successorShort} value={talent.successorsShort} />
            <Line label={t.successorMedium} value={talent.successorsMedium} />
            <Line label={t.successorLong} value={talent.successorsLong} />
          </div>
        </div>
      </div>

      {/* Bottom 5 columns */}
        <div className="grid grid-cols-5 gap-0 px-6 pb-6 pt-5">
        <div className="border-r border-[var(--tc-highlight)] px-3">
          <ColumnTitle>{t.career}</ColumnTitle>
          <div className="mt-4 space-y-2">
            {talent.careerHistory.map((item, i) => (
              <p key={i} className="text-[11px] leading-4">
                {item}
              </p>
            ))}
          </div>
        </div>
        <div className="border-r border-[var(--tc-highlight)] px-3">
          <ColumnTitle>{t.education}</ColumnTitle>
          <div className="mt-4 space-y-2">
            {talent.education.map((item, i) => (
              <p key={i} className="text-[11px] leading-4">
                {item}
              </p>
            ))}
          </div>
        </div>
        <div className="border-r border-[var(--tc-highlight)] px-3">
          <ColumnTitle>{t.competencies}</ColumnTitle>
          <div className="mt-4 space-y-2">
            {talent.competencies.map((item, i) => (
              <p key={i} className="text-[11px] leading-4">
                - {item}
              </p>
            ))}
          </div>
        </div>
        <div className="border-r border-[var(--tc-highlight)] px-3">
          <ColumnTitle>{t.development}</ColumnTitle>
          <div className="mt-4 space-y-2">
            {talent.development.map((item, i) => (
              <p key={i} className="text-[11px] leading-4">
                - {item}
              </p>
            ))}
          </div>
        </div>
        <div className="px-3">
          <ColumnTitle>{t.criticality}</ColumnTitle>
          <div className="mt-4 space-y-0.5">
            <Option label={t.high} checked={matches(talent.criticality, "high")} />
            <Option label={t.medium} checked={matches(talent.criticality, "medium")} />
            <Option label={t.low} checked={matches(talent.criticality, "low")} />
          </div>
          <div className="mt-6">
            <ColumnTitle>{t.readiness}</ColumnTitle>
            <div className="mt-4 space-y-0.5">
              {readinessOptions.map((opt, i) => (
                <Option
                  key={opt}
                  label={opt}
                  nowrap
                  checked={readinessChecked(talent.readiness, READINESS_KEYS[i]!)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
