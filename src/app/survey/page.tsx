"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { questions, surveyVersion } from "@/data/questions";
import { scoreSurvey, AnswerMap } from "@/lib/scoring";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/useSession";
import { useProfile } from "@/lib/profile";
import { SurveyResponse } from "@/lib/types";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";

const STORAGE_KEY = "talentoria-survey-progress";

export default function SurveyPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const { profile, loading: profileLoading } = useProfile(session?.user.id);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [completedResponse, setCompletedResponse] =
    useState<SurveyResponse | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading || profileLoading) return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (profile?.role === "admin") {
      router.push("/admin");
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from("survey_responses")
        .select("id,completed_at,score")
        .eq("user_id", session.user.id)
        .eq("survey_version", surveyVersion)
        .maybeSingle();

      if (data?.completed_at) {
        setCompletedResponse(data as SurveyResponse);
        setLoaded(true);
        setChecking(false);
        return;
      }

      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        setAnswers(JSON.parse(cached));
      }
      setLoaded(true);
      setChecking(false);
    };
    load();
  }, [session, loading, profile, profileLoading, router]);

  useEffect(() => {
    if (!loaded || completedResponse) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers, loaded, completedResponse]);

  const progress = useMemo(() => {
    const answered = Object.keys(answers).length;
    return Math.round((answered / questions.length) * 100);
  }, [answers]);

  const persist = async (nextAnswers: AnswerMap) => {
    if (!session || completedResponse) return;
    setSaving(true);
    await supabase.from("survey_responses").upsert(
      {
        user_id: session.user.id,
        survey_version: surveyVersion,
        answers: nextAnswers,
        updated_at: new Date().toISOString(),
        completed_at: null,
      },
      { onConflict: "user_id,survey_version" }
    );
    setSaving(false);
  };

  const handleSelect = (questionId: string, letter: AnswerMap[string]) => {
    if (completedResponse) return;
    const next = { ...answers, [questionId]: letter };
    setAnswers(next);
    persist(next);
  };

  const handleSubmit = async () => {
    if (!session || completedResponse) return;
    const report = scoreSurvey(answers);
    setSaving(true);
    await supabase.from("survey_responses").upsert(
      {
        user_id: session.user.id,
        survey_version: surveyVersion,
        answers,
        score: report,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,survey_version" }
    );
    setSaving(false);
    localStorage.removeItem(STORAGE_KEY);
    router.push("/thanks");
  };

  if (checking) {
    return (
      <main className="min-h-screen w-full bg-talentoria bg-grid px-6 py-12">
        <Card>Cargando encuesta...</Card>
      </main>
    );
  }

  if (completedResponse) {
    return (
      <main className="min-h-screen w-full bg-talentoria bg-grid px-6 py-16">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <Logo size={260} />
            <UserMenu />
          </div>
          <Card className="space-y-4">
            <h1 className="text-2xl font-bold text-white">
              Ya completaste la encuesta
            </h1>
            <p className="text-white/70">
              Para mantener la consistencia de los resultados, este test solo
              puede responderse una vez.
            </p>
            <Button onClick={() => router.push("/report/me")}>
              Ver mi reporte
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-talentoria bg-grid px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <Logo size={260} />
            <UserMenu />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Encuesta de Liderazgo Situacional
            </h1>
            <p className="mt-2 text-white/70">
              Selecciona una sola opción por situación. Responde con lo que
              realmente harías, no con la respuesta ideal. Tiempo estimado:
              15 minutos.
            </p>
          </div>
          <Card className="flex flex-col gap-2">
            <p className="text-sm text-white/70">
              Progreso: {progress}% completado
            </p>
            <div className="h-2 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--brand-cyan)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-8">
          {questions.map((question, index) => {
            const match = question.prompt.match(
              /^Situaci[oó]n\s+(\d+)\s+([\s\S]*)$/i
            );
            const situationLabel = match
              ? `Situación ${match[1]}`
              : `Situación ${index + 1}`;
            const promptBody = match ? match[2] : question.prompt;
            return (
            <Card key={question.id} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex w-fit items-center rounded-full bg-[var(--brand-magenta)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-white">
                    {situationLabel}
                  </span>
                  <span className="text-xs font-medium text-white/40">
                    {index + 1} / {questions.length}
                  </span>
                </div>
                <h2 className="text-lg font-semibold leading-relaxed text-white">
                  {promptBody}
                </h2>
              </div>
              <div className="grid gap-3">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option.letter;
                  return (
                    <button
                      key={option.letter}
                      onClick={() => handleSelect(question.id, option.letter)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        selected
                          ? "border-[var(--brand-magenta)] bg-[rgba(211,9,118,0.15)] text-white"
                          : "border-white/10 bg-white/5 text-white/80 hover:border-white/30"
                      }`}
                    >
                      <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/30 text-xs font-semibold">
                        {option.letter}
                      </span>
                      {option.text}
                    </button>
                  );
                })}
              </div>
            </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            {saving ? "Guardando..." : "Tus respuestas se guardan en automático."}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length || saving}
          >
            Finalizar y ver agradecimiento
          </Button>
        </div>
      </div>
    </main>
  );
}
