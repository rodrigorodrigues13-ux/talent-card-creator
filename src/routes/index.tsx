import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { TalentCard } from "@/components/TalentCard";
import { dict, type Lang } from "@/lib/i18n";
import { downloadTemplate, parseWorkbook, type Talent } from "@/lib/talent";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Talent Card — Excel to talent cards" },
      {
        name: "description",
        content:
          "Upload a filled Excel spreadsheet and turn every row into a printable talent card, with photo upload and one-click PDF export.",
      },
      { property: "og:title", content: "Talent Card — Excel to talent cards" },
      {
        property: "og:description",
        content:
          "Turn spreadsheet rows into talent cards with photo upload and PDF export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [lang, setLang] = useState<Lang>("en");
  const [talents, setTalents] = useState<Talent[]>([]);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const t = dict[lang];

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      const rows = await parseWorkbook(file);
      setTalents(rows);
      setPhotos({});
      toast.success(`${t.loaded}: ${rows.length} ${t.cards}`);
    } catch {
      toast.error(t.parseError);
    }
  };


  const onGeneratePdf = async () => {
    if (!talents.length || busy) return;
    setBusy(true);
    try {
      const { elementsToPdf } = await import("@/lib/pdf");
      const nodes = Array.from(
        cardsRef.current?.querySelectorAll<HTMLElement>("[data-card]") ?? [],
      );
      await elementsToPdf(nodes, "talent-cards.pdf");
      toast.success(t.pdfDone);
    } catch (err) {
      console.error(err);
      toast.error(t.pdfError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <Toaster />
      <header className="mx-auto flex max-w-7xl flex-col gap-4 px-6 pt-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="inline-flex overflow-hidden rounded-lg border-2 border-primary">
          {(["en", "pt"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={cn(
                "px-5 py-2 text-sm font-semibold transition-colors",
                lang === l
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-primary hover:bg-secondary",
              )}
            >
              {l === "en" ? dict[lang].english : dict[lang].portuguese}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {talents.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-accent/60 bg-card p-10 text-center">
            <p className="text-lg font-semibold text-primary">{t.emptyTitle}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t.emptyText}</p>
          </div>
        ) : (
          <div ref={cardsRef} className="space-y-8">
            {talents.map((talent) => (
              <div key={talent.id} data-card>
                <TalentCard
                  talent={talent}
                  t={t}
                  photoOverride={photos[talent.id]}
                  onPhotoChange={(dataUrl) =>
                    setPhotos((prev) => {
                      const next = { ...prev };
                      if (dataUrl) next[talent.id] = dataUrl;
                      else delete next[talent.id];
                      return next;
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-6">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Upload className="size-4" />
            {t.upload}
          </button>
          <button
            type="button"
            disabled={!talents.length || busy}
            onClick={onGeneratePdf}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
            {busy ? t.generating : t.generatePdf}
          </button>
          <button
            type="button"
            onClick={() => downloadTemplate(lang)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
          >
            <Download className="size-4" />
            {t.exportTemplate}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </footer>
    </div>
  );
}
