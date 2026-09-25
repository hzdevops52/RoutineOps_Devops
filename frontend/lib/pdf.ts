export type PdfExportOptions = {
  filename?: string;
  title?: string;
  landscape?: boolean;
};

export async function exportElementToPdf(element: HTMLElement | null, options: PdfExportOptions = {}) {
  if (!element) throw new Error("Nothing to export");

  const html2canvasMod = await import("html2canvas");
  const jsPdfMod = await import("jspdf");
  const html2canvas = html2canvasMod.default ?? html2canvasMod;
  const { jsPDF } = jsPdfMod;

  const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/png");

  const orientation = (options.landscape ?? true) ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "pt", format: "a4" });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const imgWidth = canvas.width * ratio;
  const imgHeight = canvas.height * ratio;
  const margin = 24;
  let y = margin;

  if (options.title) {
    pdf.setFontSize(14);
    pdf.text(options.title, pageWidth / 2, margin, { align: "center" });
    y += 20;
  }

  const x = (pageWidth - imgWidth) / 2;
  pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
  pdf.save(options.filename || "schedule.pdf");
}
