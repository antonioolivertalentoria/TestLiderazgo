import { questions, LeadershipStyle, SurveyQuestion } from "@/data/questions";

export type AnswerLetter = "A" | "B" | "C" | "D";
export type AnswerMap = Record<string, AnswerLetter>;

export type StyleStats = {
  counts: Record<LeadershipStyle, number>;
  percentages: Record<LeadershipStyle, number>;
  dominant: LeadershipStyle;
};

export type QuestionMatch = {
  id: string;
  selected: AnswerLetter;
  selectedStyle: LeadershipStyle;
  optimalStyle: LeadershipStyle;
  /** Puntaje de efectividad de la opción elegida: +2, +1, -1, -2 */
  effectiveness: number;
  isMatch: boolean;
};

export type ScoreReport = {
  totals: {
    answered: number;
    matches: number;
    effectiveness: number;
    flexibility: number;
    balance: number;
    adaptability: number;
  };
  /** Suma de efectividad oficial (rango -24 a +24) */
  effectivenessScore: number;
  /** Etiqueta cualitativa oficial (Altamente efectivo, Efectivo, ...) */
  effectivenessLabel: string;
  styles: StyleStats;
  matches: QuestionMatch[];
  narrative: {
    headline: string;
    summary: string;
    strengths: string[];
    opportunities: string[];
  };
};

const STYLES: LeadershipStyle[] = [
  "DIRIGIR",
  "ENTRENAR",
  "APOYAR",
  "DELEGAR",
];

const styleLabels: Record<LeadershipStyle, string> = {
  DIRIGIR: "Dirección clara",
  ENTRENAR: "Coaching activo",
  APOYAR: "Apoyo colaborativo",
  DELEGAR: "Delegación estratégica",
};

const styleDescription: Record<LeadershipStyle, string> = {
  DIRIGIR:
    "Define expectativas con precisión y controla avances cuando el contexto exige claridad.",
  ENTRENAR:
    "Combina dirección con escucha, elevando desempeño mientras mantiene el control.",
  APOYAR:
    "Facilita autonomía acompañada, priorizando compromiso y confianza.",
  DELEGAR:
    "Entrega control total cuando el equipo demuestra dominio y madurez.",
};

const round = (value: number, digits = 1) =>
  Number(value.toFixed(digits));

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const computeEntropy = (percentages: number[]) => {
  const normalized = percentages.map((p) => p / 100);
  const entropy = normalized.reduce((acc, p) => {
    if (p <= 0) return acc;
    return acc - p * Math.log2(p);
  }, 0);
  return entropy / Math.log2(percentages.length);
};

/**
 * Convierte la suma de efectividad (-24 a +24) en un porcentaje 1-99,
 * replicando la tabla de equivalencias oficial de la CLAVE.
 * Banda neutra [-6, 6] = 50%; cada punto fuera vale 0.49/18.
 */
const effectivenessToPercent = (score: number): number => {
  if (score > 6) return 50 + (score - 6) * (49 / 18);
  if (score < -6) return 50 - (-score - 6) * (49 / 18);
  return 50;
};

/** Etiqueta cualitativa oficial según la suma de efectividad. */
const effectivenessLabelFor = (score: number): string => {
  if (score >= 19) return "Altamente efectivo";
  if (score >= 13) return "Bastante efectivo";
  if (score >= 7) return "Efectivo";
  if (score >= -6) return "Ni efectivo, ni inefectivo";
  if (score >= -17) return "Inefectivo";
  return "Totalmente inefectivo";
};

export const scoreSurvey = (
  answers: AnswerMap,
  questionSet: SurveyQuestion[] = questions
): ScoreReport => {
  const counts: Record<LeadershipStyle, number> = {
    DIRIGIR: 0,
    ENTRENAR: 0,
    APOYAR: 0,
    DELEGAR: 0,
  };

  const matches: QuestionMatch[] = [];
  let effectivenessScore = 0;

  questionSet.forEach((question) => {
    const selected = answers[question.id];
    if (!selected) return;
    const option = question.options.find((opt) => opt.letter === selected);
    if (!option) return;
    counts[option.style] += 1;
    effectivenessScore += option.effectiveness;

    const optimal = question.options.find((opt) => opt.isOptimal);
    const optimalStyle = optimal?.style ?? option.style;
    matches.push({
      id: question.id,
      selected,
      selectedStyle: option.style,
      optimalStyle,
      effectiveness: option.effectiveness,
      isMatch: option.isOptimal,
    });
  });

  const answered = matches.length;
  const matchCount = matches.filter((m) => m.isMatch).length;

  // Efectividad oficial (modelo Hersey-Blanchard, pesos -2/-1/+1/+2).
  const effectivenessPct = round(effectivenessToPercent(effectivenessScore));
  const effectivenessLabel = effectivenessLabelFor(effectivenessScore);

  // USO de estilos (distribución sobre las situaciones respondidas).
  const percentages = STYLES.reduce((acc, style) => {
    acc[style] = answered ? (counts[style] / answered) * 100 : 0;
    return acc;
  }, {} as Record<LeadershipStyle, number>);

  // Flexibilidad de estilos: amplitud / variedad del repertorio usado.
  const flexibility = round(computeEntropy(Object.values(percentages)) * 100);
  const balanceDeviation = Object.values(percentages).reduce(
    (acc, p) => acc + Math.abs(p - 25),
    0
  );
  const balance = round(clamp(100 - (balanceDeviation / 150) * 100));

  const dominant = STYLES.reduce((best, style) =>
    counts[style] > counts[best] ? style : best
  , STYLES[0]);

  const headline = `${styleLabels[dominant]} · ${effectivenessLabel}`;
  const summary = `Tu estilo dominante es ${dominant.toLowerCase()}. Tu efectividad situacional es ${effectivenessPct}% (${effectivenessLabel}), con ${matchCount} de ${answered} decisiones en el estilo óptimo.`;

  const strengths = [
    `Predomina ${styleLabels[dominant]}: ${styleDescription[dominant]}`,
    `Efectividad situacional: ${effectivenessPct}% (${effectivenessLabel}, puntaje ${effectivenessScore} de 24).`,
    `Decisiones óptimas: ${matchCount} de ${answered} situaciones en el estilo más apropiado.`,
  ];

  const opportunities = [
    `Flexibilidad de estilos: ${flexibility}% (variedad del repertorio de liderazgo).`,
    `Balance de estilos: ${balance}% (evita depender en exceso de un solo enfoque).`,
    `Practica alternar entre dirigir, entrenar, apoyar y delegar según el nivel de madurez del colaborador.`,
  ];

  return {
    totals: {
      answered,
      matches: matchCount,
      effectiveness: effectivenessPct,
      flexibility,
      balance,
      adaptability: effectivenessPct,
    },
    effectivenessScore,
    effectivenessLabel,
    styles: {
      counts,
      percentages: Object.fromEntries(
        STYLES.map((style) => [style, round(percentages[style])])
      ) as Record<LeadershipStyle, number>,
      dominant,
    },
    matches,
    narrative: {
      headline,
      summary,
      strengths,
      opportunities,
    },
  };
};
