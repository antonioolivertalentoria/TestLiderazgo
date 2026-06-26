import { ScoreReport } from "@/lib/scoring";

export type SurveyResponse = {
  id: string;
  user_id: string;
  answers: Record<string, string>;
  score: ScoreReport | null;
  completed_at: string | null;
  created_at: string;
};

