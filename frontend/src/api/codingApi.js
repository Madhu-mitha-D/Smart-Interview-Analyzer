import api from "./axios";

export const startCodingInterview = (difficulty, language) =>
  api.post("/coding/start", { difficulty, language });

export const submitCode = (question_id, code, language) =>
  api.post("/coding/submit", { question_id, code, language });