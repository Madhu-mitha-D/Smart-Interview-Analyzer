import { useState } from "react";
import { startResumeInterview } from "../api/resumeApi";
import { PrimaryButton } from "./Buttons";

export default function ResumeInterview({ onStart }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [previewSkills, setPreviewSkills] = useState([]);

  const handleResumeStart = async () => {
    if (!resumeFile) {
      setResumeError("Please upload a PDF or DOCX resume.");
      return;
    }

    try {
      setResumeLoading(true);
      setResumeError("");
      setPreviewSkills([]);

      const formData = new FormData();
      formData.append("resume", resumeFile);

      const res = await startResumeInterview(formData);
      const data = res.data;

      setPreviewSkills(data.skills || []);

      if (onStart) {
        onStart({
          session_id: data.session_id,
          domain: data.domain,
          difficulty: data.difficulty,
          question_index: data.question_index,
          question: data.question,
        });
      }
    } catch (err) {
      setResumeError(
        err?.response?.data?.detail || "Failed to start resume interview."
      );
    } finally {
      setResumeLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm text-white/70">
          Upload Resume (PDF or DOCX)
        </label>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => {
            setResumeFile(e.target.files?.[0] || null);
            setResumeError("");
            setPreviewSkills([]);
          }}
          className="block w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-black"
        />
      </div>

      <PrimaryButton
        onClick={handleResumeStart}
        disabled={resumeLoading}
        className="px-6 py-3"
      >
        {resumeLoading ? "Starting..." : "Start Resume Interview"}
      </PrimaryButton>

      {resumeError ? (
        <p className="text-red-400 font-medium">{resumeError}</p>
      ) : null}

      {previewSkills.length > 0 ? (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-5">
          <div>
            <h3 className="text-lg font-semibold">Detected Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {previewSkills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-white/60">
            Resume interview started successfully.
          </p>
        </div>
      ) : null}
    </div>
  );
}