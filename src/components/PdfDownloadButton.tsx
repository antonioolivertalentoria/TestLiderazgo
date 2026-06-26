"use client";

import { RefObject, useState } from "react";
import { Button } from "@/components/Button";
import { ScoreReport } from "@/lib/scoring";
import PdfReportDocument from "@/components/PdfReportDocument";

type PdfDownloadButtonProps = {
  targetRef: RefObject<HTMLElement | null>;
  filename?: string;
  report: ScoreReport;
};

export default function PdfDownloadButton({
  targetRef,
  filename = "reporte-talentoria.pdf",
  report,
}: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (typeof window === "undefined") return;
    if (loading) return;
    setLoading(true);
    const { pdf } = await import("@react-pdf/renderer");
    const logoUrl = new URL("/logo-talentoria.png", window.location.origin).toString();
    const generatedAt = new Date().toLocaleString("es-MX");
    const blob = await pdf(
      <PdfReportDocument report={report} logoUrl={logoUrl} generatedAt={generatedAt} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  };

  return (
    <Button onClick={handleDownload} disabled={loading}>
      {loading ? "Generando PDF..." : "Descargar PDF"}
    </Button>
  );
}
