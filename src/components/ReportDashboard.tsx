"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ScoreReport } from "@/lib/scoring";
import { Card } from "@/components/Card";

type ReportDashboardProps = {
  report: ScoreReport;
};

export function ReportDashboard({ report }: ReportDashboardProps) {
  const chartData = Object.entries(report.styles.percentages).map(
    ([style, value]) => ({
      name: style,
      value,
    })
  );

  const stats = [
    {
      label: "Efectividad",
      value: `${report.totals.effectiveness}%`,
    },
    {
      label: "Nivel",
      value: report.effectivenessLabel,
    },
    {
      label: "Puntaje",
      value: `${report.effectivenessScore} / 24`,
    },
    {
      label: "Decisiones óptimas",
      value: `${report.totals.matches} / ${report.totals.answered}`,
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="space-y-4 print-card">
        <p className="text-xs uppercase tracking-[0.3em] text-dim">
          Resumen
        </p>
        <h2 className="text-2xl font-bold text-white">{report.narrative.headline}</h2>
        <p className="text-muted">{report.narrative.summary}</p>
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-glass bg-glass p-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-faint">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 print-card">
        <p className="text-xs uppercase tracking-[0.3em] text-dim">
          Distribución de estilos
        </p>
        <div className="h-64 min-h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.08)" }}
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#fff",
                }}
              />
              <Bar dataKey="value" fill="#D30976" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="print-card">
          <p className="text-xs uppercase tracking-[0.3em] text-dim">
            Fortalezas
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {report.narrative.strengths.map((item) => (
              <li key={item} className="border-l border-glass pl-3">
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="print-card">
          <p className="text-xs uppercase tracking-[0.3em] text-dim">
            Oportunidades
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {report.narrative.opportunities.map((item) => (
              <li key={item} className="border-l border-glass pl-3">
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="print-card">
        <p className="text-xs uppercase tracking-[0.3em] text-dim">
          Match por situación
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {report.matches.map((match) => (
            <div
              key={match.id}
              className="rounded-2xl border border-glass bg-glass p-4"
            >
              <p className="text-sm font-semibold text-white">
                {match.id}
              </p>
              <p className="text-xs text-dim">
                Elegido: {match.selectedStyle}
              </p>
              <p className="text-xs text-dim">
                Óptimo: {match.optimalStyle}
              </p>
              <p className="text-xs text-dim">
                Efectividad: {match.effectiveness > 0 ? "+" : ""}
                {match.effectiveness}
              </p>
              <p
                className={`mt-2 text-xs font-semibold ${
                  match.isMatch ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {match.isMatch ? "Alineado" : "Ajuste posible"}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
