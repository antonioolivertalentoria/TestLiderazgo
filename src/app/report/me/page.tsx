"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "@/components/Card";
import { Logo } from "@/components/Logo";
import { ReportDashboard } from "@/components/ReportDashboard";
import { UserMenu } from "@/components/UserMenu";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/useSession";
import { SurveyResponse } from "@/lib/types";

const PdfDownloadButton = dynamic(
  () => import("@/components/PdfDownloadButton"),
  { ssr: false }
);

export default function MyReportPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.push("/login");
      return;
    }
    supabase
      .from("survey_responses")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setResponse(data as SurveyResponse | null);
        setLoadingReport(false);
      });
  }, [session, loading, router]);


  return (
    <main className="min-h-screen w-full bg-talentoria bg-grid px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Logo size={240} />
            <h1 className="mt-4 text-3xl font-extrabold text-white">
              Reporte personal
            </h1>
            <p className="text-white/70">
              Visualización profesional con métricas accionables.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {response?.score ? (
              <PdfDownloadButton targetRef={reportRef} report={response.score} />
            ) : null}
            <UserMenu />
          </div>
        </div>

        {loadingReport ? (
          <Card>Cargando reporte...</Card>
        ) : !response?.score ? (
          <Card className="text-white/70">
            Aún no hay un reporte disponible. Completa la encuesta para
            generarlo.
          </Card>
        ) : (
          <div ref={reportRef} className="space-y-8 print-target print-mode">
            <ReportDashboard report={response.score} />
          </div>
        )}
      </div>
    </main>
  );
}
