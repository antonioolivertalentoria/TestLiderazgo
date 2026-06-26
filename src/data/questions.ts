import raw from "@/data/questions.json";

export type LeadershipStyle = "DIRIGIR" | "ENTRENAR" | "APOYAR" | "DELEGAR";
export type LeadershipStyleCode = "S1" | "S2" | "S3" | "S4";

export type SurveyOption = {
  letter: "A" | "B" | "C" | "D";
  text: string;
  style: LeadershipStyle;
  styleCode: LeadershipStyleCode;
  /** Puntaje de efectividad oficial: +2 (óptimo), +1, -1, -2 */
  effectiveness: number;
  isOptimal: boolean;
};

export type SurveyQuestion = {
  id: string;
  prompt: string;
  options: SurveyOption[];
};

export const surveyVersion = "2026-06-26-v2";

export const questions: SurveyQuestion[] = raw.questions.map(
  (question, index) => ({
    id: `S${index + 1}`,
    prompt: question.prompt,
    options: question.options.map((option) => ({
      letter: option.letter as SurveyOption["letter"],
      text: option.text,
      style: option.style as LeadershipStyle,
      styleCode: option.styleCode as LeadershipStyleCode,
      effectiveness: option.effectiveness,
      isOptimal: option.isCorrect,
    })),
  })
);
