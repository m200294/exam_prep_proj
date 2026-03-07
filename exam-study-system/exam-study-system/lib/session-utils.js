import { SUBJECTS } from "./subjects";

export function aggregateTopics(sessions, subject) {
  const allTopics = SUBJECTS[subject].topics;
  const aggregate = {};

  allTopics.forEach((topic) => {
    aggregate[topic] = { attempted: 0, correct: 0, partial: 0, wrong: 0 };
  });

  sessions.forEach((session) => {
    if (!session.topicBreakdown) {
      return;
    }

    Object.entries(session.topicBreakdown).forEach(([topic, value]) => {
      if (!aggregate[topic]) {
        aggregate[topic] = { attempted: 0, correct: 0, partial: 0, wrong: 0 };
      }

      aggregate[topic].attempted += value.attempted || 0;
      aggregate[topic].correct += value.correct || 0;
      aggregate[topic].partial += value.partial || 0;
      aggregate[topic].wrong += value.wrong || 0;
    });
  });

  return aggregate;
}

export function calculateAccuracy(correct = 0, partial = 0, attempted = 0) {
  if (!attempted) {
    return 0;
  }

  return Math.round(((correct + partial * 0.5) / attempted) * 100);
}

export function getSessionTotals(sessions) {
  return sessions.reduce(
    (totals, session) => {
      totals.attempted += session.attempted || 0;
      totals.correct += session.correct || 0;
      totals.partial += session.partial || 0;
      totals.wrong += session.wrong || 0;
      return totals;
    },
    { attempted: 0, correct: 0, partial: 0, wrong: 0 }
  );
}

export function getWeakAreaCounts(sessions) {
  const counts = {};

  sessions.flatMap((session) => session.weakAreas || []).forEach((area) => {
    counts[area] = (counts[area] || 0) + 1;
  });

  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}
