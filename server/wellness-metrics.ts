type GenericRecord = Record<string, unknown>;

type WellnessData = {
  meditationSessions: GenericRecord[];
  mindfulnessSessions: GenericRecord[];
  moodEntries: GenericRecord[];
  journalEntries: GenericRecord[];
  gratitudeEntries: GenericRecord[];
  habits: GenericRecord[];
  goals: GenericRecord[];
  todos: GenericRecord[];
  activityLogs: GenericRecord[];
  sleepLogs: GenericRecord[];
  waterLogs: GenericRecord[];
  socialInteractions: GenericRecord[];
};

const ratingScores: Record<string, number> = {
  "Very Positive": 100,
  Positive: 80,
  Neutral: 60,
  Negative: 35,
  "Very Negative": 15,
};

const categoryMultipliers: Record<string, number> = {
  Family: 1.1,
  Friends: 1.05,
  Animals: 1,
  Strangers: 0.9,
};

const activityMet: Record<string, number> = {
  Running: 9.8,
  Gym: 6,
  Sports: 7,
  Walking: 3.5,
  Yoga: 3,
};

function toDate(record: GenericRecord): Date {
  return new Date(String(record.createdAt ?? record.startedAt ?? 0));
}

function inLastDays(record: GenericRecord, days: number) {
  const min = Date.now() - days * 24 * 60 * 60 * 1000;
  return toDate(record).getTime() >= min;
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function clamp100(value: number) {
  return Math.max(0, Math.min(100, value));
}

function stdev(values: number[]) {
  if (values.length < 2) return 0;
  const mean = avg(values);
  const variance = avg(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function dailyCounts(records: GenericRecord[], days: number, mapValue?: (record: GenericRecord) => number) {
  const output: Array<{ day: string; count: number; value?: number }> = [];

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    const dayRecords = records.filter((record) => toDate(record).toISOString().slice(0, 10) === key);
    const values = mapValue ? dayRecords.map(mapValue) : [];
    output.push({
      day: key.slice(5),
      count: dayRecords.length,
      value: values.length ? avg(values) : 0,
    });
  }

  return output;
}

function getSocialImpact(record: GenericRecord) {
  const rating = String(record.rating ?? "Neutral");
  const category = String(record.category ?? "Friends");
  const base = ratingScores[rating] ?? 60;
  const multiplier = categoryMultipliers[category] ?? 1;
  return Math.min(100, Math.round(base * multiplier));
}

function dayKey(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}

function latestByKey(records: GenericRecord[], keyField: string) {
  const map = new Map<string, GenericRecord>();

  for (const record of records) {
    const key = String(record[keyField] ?? "").trim();
    if (!key) continue;

    const existing = map.get(key);
    if (!existing || toDate(record).getTime() > toDate(existing).getTime()) {
      map.set(key, record);
    }
  }

  return Array.from(map.values());
}

function latestPerDay(records: GenericRecord[]) {
  const map = new Map<string, GenericRecord>();

  for (const record of records) {
    const key = dayKey(toDate(record));
    const existing = map.get(key);
    if (!existing || toDate(record).getTime() > toDate(existing).getTime()) {
      map.set(key, record);
    }
  }

  return Array.from(map.values());
}

function computeSnapshot(windowData: WellnessData, windowDays: number) {
  const meditationWindow = windowData.meditationSessions;
  const mindfulnessWindow = windowData.mindfulnessSessions;
  const moodWindow = windowData.moodEntries;
  const journalWindow = windowData.journalEntries;
  const gratitudeWindow = windowData.gratitudeEntries;
  const socialWindow = windowData.socialInteractions;
  const activityWindow = windowData.activityLogs;
  const sleepWindow = latestPerDay(windowData.sleepLogs);
  const waterWindow = latestPerDay(windowData.waterLogs);
  const habitState = latestByKey(windowData.habits, "habitName");
  const goalState = latestByKey(windowData.goals, "title");
  const todoState = latestByKey(windowData.todos, "text");

  const meditationMinutes = sum(meditationWindow.map((record) => Number(record.duration ?? 0)));
  const mindfulnessMinutes = sum(mindfulnessWindow.map((record) => Number(record.duration ?? 0)));
  const sleepHours = sleepWindow.map((record) => Number(record.durationH ?? 0));
  const avgSleep = avg(sleepHours);
  const sleepConsistency = stdev(sleepHours);

  const moodScores = moodWindow.map((record) => Number(record.moodScore ?? 0));
  const moodAvg = avg(moodScores);
  const moodNorm = clamp100(((moodAvg - 1) / 4) * 100);

  const gratitudeDays = new Set(gratitudeWindow.map((record) => dayKey(toDate(record)))).size;
  const journalDays = new Set(journalWindow.map((record) => dayKey(toDate(record)))).size;

  const gratitudeNorm = clamp100((gratitudeDays / Math.max(1, windowDays)) * 100);
  const journalStreakNorm = clamp100((Math.min(journalDays, windowDays) / Math.max(1, windowDays)) * 100);

  const socialImpacts = socialWindow.map(getSocialImpact);
  const socialAverageImpact = avg(socialImpacts);
  const socialFrequencyScore = clamp100((socialWindow.length / 10) * 100);
  const socialScore = Math.round(socialAverageImpact * 0.75 + socialFrequencyScore * 0.25);

  const completedHabits = habitState.filter((habit) => Boolean(habit.completedToday)).length;
  const habitPct = habitState.length ? (completedHabits / habitState.length) * 100 : 0;

  const activeGoals = goalState.filter((goal) => !Boolean(goal.completed));
  const goalPct = activeGoals.length
    ? avg(activeGoals.map((goal) => Number(goal.progress ?? 0)))
    : 0;

  const doneTasks = todoState.filter((task) => Boolean(task.completed)).length;
  const taskPct = todoState.length ? (doneTasks / todoState.length) * 100 : 0;

  const activityMinutes = sum(activityWindow.map((record) => Number(record.duration ?? 0)));
  const activityNorm = clamp100((activityMinutes / 150) * 100);

  const waterPct = avg(
    waterWindow.map((record) => {
      const glasses = Number(record.glasses ?? 0);
      const goal = Number(record.goal ?? 8);
      return clamp100((glasses / Math.max(goal, 1)) * 100);
    })
  );

  const mindScore = Math.round(
    clamp100(
      (((meditationMinutes + mindfulnessMinutes) / 70 + avgSleep / 8 + (meditationWindow.length + mindfulnessWindow.length) / 7) / 3) *
        100,
    ),
  );

  const emotionalScore = Math.round(clamp100(moodNorm * 0.5 + journalStreakNorm * 0.3 + gratitudeNorm * 0.2));
  const productivityScore = Math.round(clamp100(habitPct * 0.5 + goalPct * 0.3 + taskPct * 0.2));
  const physicalScore = Math.round(clamp100(activityNorm * 0.6 + waterPct * 0.4));

  const lifeSyncScore = Math.round(
    mindScore * 0.25 + emotionalScore * 0.2 + socialScore * 0.2 + productivityScore * 0.2 + physicalScore * 0.15,
  );

  const positiveInteractions = socialWindow.filter((record) => {
    const rating = String(record.rating ?? "");
    return rating === "Positive" || rating === "Very Positive";
  }).length;

  const socialPositiveRatio = socialWindow.length ? (positiveInteractions / socialWindow.length) * 100 : 0;

  const caloriesEstimated = sum(
    activityWindow.map((record) => {
      const duration = Number(record.duration ?? 0);
      const met = activityMet[String(record.type ?? "Walking")] ?? 4;
      return (duration * met * 70) / 60;
    })
  );

  const crossPillar = {
    sleepVsMood: {
      correlationHint: avgSleep < 6.5 && moodAvg < 3 ? "negative" : "stable",
      avgSleep,
      avgMood: moodAvg,
    },
    meditationVsProductivity: {
      meditationDays: meditationWindow.length,
      taskCompletionPct: taskPct,
      signal: meditationWindow.length >= 3 && taskPct >= 60 ? "positive" : "weak",
    },
    activityVsEmotional: {
      activityMinutes,
      emotionalScore,
      signal: activityMinutes >= 150 && emotionalScore >= 70 ? "positive" : "watch",
    },
    gratitudeVsMood: {
      gratitudeEntries: gratitudeWindow.length,
      avgMood: moodAvg,
      signal: gratitudeWindow.length >= 5 && moodAvg >= 3.5 ? "positive" : "watch",
    },
    socialVsMood: {
      socialPositiveRatio,
      avgMood: moodAvg,
      signal: socialPositiveRatio >= 70 && moodAvg >= 3.5 ? "positive" : "watch",
    },
  };

  return {
    metrics: {
      meditationMinutes,
      mindfulnessMinutes,
      avgMeditationSession: avg(meditationWindow.map((record) => Number(record.duration ?? 0))),
      avgSleep,
      sleepConsistency,
      moodAvg,
      moodHigh: moodScores.length ? Math.max(...moodScores) : 0,
      moodLow: moodScores.length ? Math.min(...moodScores) : 0,
      gratitudeEntries: gratitudeWindow.length,
      journalEntries: journalWindow.length,
      socialInteractions: socialWindow.length,
      socialPositiveRatio,
      habitCompletionPct: habitPct,
      goalProgressPct: goalPct,
      taskCompletionPct: taskPct,
      activityMinutes,
      caloriesEstimated: Math.round(caloriesEstimated),
      hydrationPct: Math.round(waterPct),
    },
    scores: {
      mindScore,
      emotionalScore,
      socialScore,
      productivityScore,
      physicalScore,
      lifeSyncScore,
    },
    crossPillar,
  };
}

export function buildWellnessSummary(data: WellnessData, days: number) {
  const filteredData: WellnessData = {
    meditationSessions: data.meditationSessions.filter((record) => inLastDays(record, days)),
    mindfulnessSessions: data.mindfulnessSessions.filter((record) => inLastDays(record, days)),
    moodEntries: data.moodEntries.filter((record) => inLastDays(record, days)),
    journalEntries: data.journalEntries.filter((record) => inLastDays(record, days)),
    gratitudeEntries: data.gratitudeEntries.filter((record) => inLastDays(record, days)),
    habits: data.habits.filter((record) => inLastDays(record, days)),
    goals: data.goals.filter((record) => inLastDays(record, days)),
    todos: data.todos.filter((record) => inLastDays(record, days)),
    activityLogs: data.activityLogs.filter((record) => inLastDays(record, days)),
    sleepLogs: data.sleepLogs.filter((record) => inLastDays(record, days)),
    waterLogs: data.waterLogs.filter((record) => inLastDays(record, days)),
    socialInteractions: data.socialInteractions.filter((record) => inLastDays(record, days)),
  };

  const snapshot = computeSnapshot(filteredData, days);

  const trendWindowDays = Math.min(days, 7);
  const lifeSync7d = Array.from({ length: trendWindowDays }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (trendWindowDays - 1 - index));
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const inWindow = (record: GenericRecord) => {
      const value = toDate(record).getTime();
      return value >= start.getTime() && value <= end.getTime();
    };

    const windowData: WellnessData = {
      meditationSessions: data.meditationSessions.filter(inWindow),
      mindfulnessSessions: data.mindfulnessSessions.filter(inWindow),
      moodEntries: data.moodEntries.filter(inWindow),
      journalEntries: data.journalEntries.filter(inWindow),
      gratitudeEntries: data.gratitudeEntries.filter(inWindow),
      habits: data.habits.filter(inWindow),
      goals: data.goals.filter(inWindow),
      todos: data.todos.filter(inWindow),
      activityLogs: data.activityLogs.filter(inWindow),
      sleepLogs: data.sleepLogs.filter(inWindow),
      waterLogs: data.waterLogs.filter(inWindow),
      socialInteractions: data.socialInteractions.filter(inWindow),
    };

    const daySnapshot = computeSnapshot(windowData, 7);

    return {
      day: dayKey(date).slice(5),
      count: windowData.socialInteractions.length,
      value: daySnapshot.scores.lifeSyncScore,
    };
  });

  return {
    periodDays: days,
    metrics: snapshot.metrics,
    scores: snapshot.scores,
    trends: {
      lifeSync7d,
      socialFrequency7d: dailyCounts(filteredData.socialInteractions, Math.min(days, 7)),
      socialWellness7d: dailyCounts(filteredData.socialInteractions, Math.min(days, 7), getSocialImpact),
    },
    crossPillar: snapshot.crossPillar,
  };
}

export function buildInsightFromSummary(summary: ReturnType<typeof buildWellnessSummary>) {
  const { scores, metrics, crossPillar } = summary;
  const strengths: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];

  if (scores.emotionalScore >= 75) strengths.push("Emotional wellness is strong this week, with stable mood and reflective habits.");
  if (metrics.socialPositiveRatio >= 70) strengths.push("Most social interactions were positive, which supports social resilience.");
  if (metrics.activityMinutes >= 150) strengths.push("You met a high activity threshold, supporting physical and emotional wellness.");
  if (metrics.hydrationPct >= 80) strengths.push("Hydration consistency stayed in a healthy range.");

  if (metrics.avgSleep < 7) improvements.push("Average sleep is below target; this may be limiting focus and mood stability.");
  if (scores.productivityScore < 65) improvements.push("Productivity score is lagging behind other pillars.");
  if (metrics.socialInteractions < 5) improvements.push("Social interaction frequency is low this week.");
  if (metrics.hydrationPct < 70) improvements.push("Hydration is below your recommended weekly average.");

  if (crossPillar.sleepVsMood.correlationHint === "negative") {
    recommendations.push("Prioritize 7+ hours of sleep for the next 3 nights to support mood recovery.");
  }

  if (crossPillar.meditationVsProductivity.signal === "weak") {
    recommendations.push("Schedule a short morning meditation before your first focus block to improve task completion.");
  }

  if (metrics.activityMinutes < 150) {
    recommendations.push("Add two 20-minute movement sessions this week to raise physical and emotional scores.");
  }

  if (metrics.socialPositiveRatio < 70) {
    recommendations.push("Plan one intentional positive social interaction in the next 48 hours.");
  }

  if (recommendations.length < 3) {
    recommendations.push("Keep current routines consistent for 7 days and re-check your LifeSync score trend.");
  }

  const summaryText = `Your LifeSync score is ${scores.lifeSyncScore}/100 this week. Mind: ${scores.mindScore}, Emotional: ${scores.emotionalScore}, Social: ${scores.socialScore}, Productivity: ${scores.productivityScore}, Physical: ${scores.physicalScore}. Focus first on the weakest pillar to create balanced improvement.`;

  return {
    summary: summaryText,
    wellness_score: scores.lifeSyncScore,
    strengths: strengths.slice(0, 5),
    improvements: improvements.slice(0, 5),
    recommendations: recommendations.slice(0, 6),
    generated_at: new Date().toISOString(),
  };
}
