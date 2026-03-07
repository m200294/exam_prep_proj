export const SUBJECTS = {
  MATH: {
    label: "MATH",
    fullName: "Mathematics",
    code: "MATH101",
    examDate: "2026-06-10",
    accent: "#ff6b35",
    topics: ["Calculus", "Linear Algebra", "Probability", "Statistics", "Other"],
    topicColors: {
      Calculus: "#ff6b35",
      "Linear Algebra": "#4ecdc4",
      Probability: "#ffe66d",
      Statistics: "#a8e6cf",
      Other: "#777777",
    },
  },
  PHYS: {
    label: "PHYS",
    fullName: "Physics",
    code: "PHYS201",
    examDate: "2026-06-12",
    accent: "#4ecdc4",
    topics: ["Mechanics", "Electromagnetism", "Thermodynamics", "Optics", "Quantum", "Other"],
    topicColors: {
      Mechanics: "#4ecdc4",
      Electromagnetism: "#ff6b35",
      Thermodynamics: "#ffe66d",
      Optics: "#c3b1e1",
      Quantum: "#a8e6cf",
      Other: "#777777",
    },
  },
  CHEM: {
    label: "CHEM",
    fullName: "Chemistry",
    code: "CHEM150",
    examDate: "2026-06-15",
    accent: "#c3b1e1",
    topics: ["Organic", "Inorganic", "Physical Chemistry", "Biochemistry", "Other"],
    topicColors: {
      Organic: "#c3b1e1",
      Inorganic: "#ffd3b6",
      "Physical Chemistry": "#7ec8e3",
      Biochemistry: "#ffe66d",
      Other: "#777777",
    },
  },
};

export function daysUntil(dateString) {
  return Math.max(0, Math.ceil((new Date(dateString) - new Date()) / 86400000));
}
