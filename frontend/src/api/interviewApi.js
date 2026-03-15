import api from "./axios";

export const startInterview = (domain, difficulty) =>
  api.post("/start-interview", { domain, difficulty });

export const submitAnswer = (session_id, answer) =>
  api.post("/submit-answer", { session_id, answer });

export const getMyInterviews = () =>
  api.get("/interviews/my");

export const getInterviewState = (session_id) =>
  api.get(`/interviews/${session_id}/state`);

export const deleteInterview = (session_id) =>
  api.delete(`/interviews/${session_id}`);