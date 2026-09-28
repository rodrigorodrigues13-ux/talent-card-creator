import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

/**
 * Renders the given elements into a single PDF, one page per element.
 * Runs only in the browser (called from an event handler).
 */
export async function elementsToPdf(elements: HTMLElement[], filename: string) {
  if (!elements.length) throw new Error("No content to render");

  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i]!;
    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false,
      logging: false,
      ignoreElements: (node) => node instanceof HTMLElement && node.dataset['pdfHide'] !== undefined,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const margin = 18;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", (pageW - w) / 2, (pageH - h) / 2, w, h);
  }

  pdf.save(filename);
}
