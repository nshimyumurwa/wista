"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useProfile } from "../lib/useProfile";

export default function ReportButton({ opportunityId }) {
  const { profile } = useProfile();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!profile) return null;
  if (done) return <p className="success">Thank you. An administrator will review your report.</p>;

  async function report() {
    const reason = prompt("Why are you reporting this opportunity?");
    if (!reason || !reason.trim()) return;
    const { error: err } = await supabase.from("reports").insert({
      opportunity_id: opportunityId,
      reporter_id: profile.id,
      reason: reason.trim(),
    });
    if (err) setError("Could not send the report: " + err.message);
    else setDone(true);
  }

  return (
    <div>
      <button className="linkbtn" onClick={report}>Report this opportunity</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}