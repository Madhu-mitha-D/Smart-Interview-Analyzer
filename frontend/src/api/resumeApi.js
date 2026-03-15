import api from "./axios";

export const startResumeInterview = (formData) =>
  api.post("/resume/start-interview", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const uploadResume = (formData) =>
  api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });