export const MOVIE_GENRES = [
  "로맨스",
  "액션",
  "공포",
  "가족",
  "SF",
  "애니",
  "스릴러",
  "코미디",
] as const;

export type MovieGenre = (typeof MOVIE_GENRES)[number];
