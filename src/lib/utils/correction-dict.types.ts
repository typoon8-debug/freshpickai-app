export type DictEntry = {
  wrong: string;
  correct: string;
  /** 출처: manual | etl | user_feedback */
  source: "manual" | "etl" | "user_feedback";
};
