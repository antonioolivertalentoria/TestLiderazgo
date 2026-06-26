"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/useSession";
import { ScoreReport } from "@/lib/scoring";

const PdfDownloadButton = dynamic(
  () => import("@/components/PdfDownloadButton"),
  { ssr: false }
);

export default function ThanksPage() {
  const { session, loading } = useSession();
  const [report, setReport] = useState<ScoreReport | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !session) return;
    supabase
      .from("survey_responses")
      .select("score")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setReport((data?.score as ScoreReport) ?? null);
      });
  }, [session, loading]);

  return (
    <main className="min-h-screen w-full bg-talentoria bg-grid px-6 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 text-center">
        <div className="flex w-full items-center justify-between gap-4">
          <Logo size={200} />
          <UserMenu />
        </div>

        <Card className="w-full space-y-6">
          <h1 className="text-3xl font-extrabold text-white">
            Gracias por completar la evaluación.
          </h1>
          <p className="text-white/70">
            Tu reporte ya está listo. Talentoría convierte respuestas en
            decisiones accionables.
          </p>

          <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-5 text-left">
            <p className="text-sm font-semibold text-amber-200">
              ⚠️ Descarga tu reporte antes de salir
            </p>
            <p className="mt-1 text-sm text-white/70">
              Si cierras sesión sin descargarlo, no podrás volver a verlo (tu
              acceso de invitado no usa correo ni contraseña). Guarda tu PDF
              ahora.
            </p>
          </div>

          {/* Contenedor de referencia para la generación del PDF */}
          <div ref={reportRef} className="hidden" />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {report ? (
              <PdfDownloadButton targetRef={reportRef} report={report} />
            ) : (
              <Button disabled>Preparando tu reporte...</Button>
            )}
            <Link href="/report/me">
              <Button variant="outline">Ver mi reporte completo</Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
