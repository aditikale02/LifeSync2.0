export const interactionCategories = ["Friends", "Family", "Strangers", "Animals"] as const;

export const interactionRatings = [
  "Very Positive",
  "Positive",
  "Neutral",
  "Negative",
  "Very Negative",
] as const;

export type InteractionCategory = typeof interactionCategories[number];
export type InteractionRating = typeof interactionRatings[number];

export const interactionRatingScores: Record<InteractionRating, number> = {
  "Very Positive": 100,
  Positive: 80,
  Neutral: 60,
  Negative: 35,
  "Very Negative": 15,
};

export const interactionCategoryMultipliers: Record<InteractionCategory, number> = {
  Friends: 1.05,
  Family: 1.1,
  Strangers: 0.9,
  Animals: 1.0,
};
