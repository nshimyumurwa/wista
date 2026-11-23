"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RoleGuard from "../../../components/RoleGuard";
import { supabase } from "../../../lib/supabase";

const TYPES = ["training", "competition", "mentorship", "scholarship", "internship", "career"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "All levels"];

function Form({ profile }) {
  const router = useRouter();
  const [f, setF] = useState({
    title: "", type: "training", sport: "", location: "",
    experience_level: "All levels", description: "", eligibility: "",
    start_date: "", end_date: "", deadline: "", allows_registration: false,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  if (profile.verification_status !== "verified") {
    return <p className="empty">Your account must be verified by an administrator before you can publish.</p>;
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!f.title.trim() || !f.sport.trim() || !f.location.trim() || !f.description.trim()) {
      setError("Title, sport, location and description are required.");
      return;
    }
    if (f.start_date && f.end_date && f.end_date < f.start_date) {
      setError("The end date cannot be before the start date.");
      return;
    }
    setSaving(true);
    const row = {
      ...f,
      title: f.title.trim(), sport: f.sport.trim(), location: f.location.trim(),
      description: f.description.trim(),
      eligibility: f.eligibility.trim() || null,
      start_date: f.start_date || null, end_date: f.end_date || null, deadline: f.deadline || null,
      provider_id: profile.id,
    };
    const { data, error } = await supabase.from("opportunities").insert(row).select("id").single();
    setSaving(false);
    if (error) { setError(error.message); return; }
    router.push("/opportunities/" + data.id);
  }

  return (
    <form onSubmit={submit} className="card" style={{ display: "grid", gap: 12 }}>
      <label>Title *<input value={f.title} onChange={set("title")} /></label>
      <label>Type *
        <select value={f.type} onChange={set("type")}>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label>Sport *<input value={f.sport} onChange={set("sport")} placeholder="e.g. Football" /></label>
      <label>Location *<input value={f.location} onChange={set("location")} placeholder="e.g. Kigali" /></label>
      <label>Experience level
        <select value={f.experience_level} onChange={set("experience_level")}>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </label>
      <label>Description *<textarea rows={5} value={f.description} onChange={set("description")} /></label>
      <label>Eligibility<textarea rows={3} value={f.eligibility} onChange={set("eligibility")} /></label>
      <label>Start date<input type="date" value={f.start_date} onChange={set("start_date")} /></label>
      <label>End date<input type="date" value={f.end_date} onChange={set("end_date")} /></label>
      <label>Application deadline<input type="date" value={f.deadline} onChange={set("deadline")} /></label>
      <label>
        <input type="checkbox" checked={f.allows_registration} onChange={set("allows_registration")} />{" "}
        Participants register (instead of applying)
      </label>
      {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
      <button type="submit" disabled={saving}>{saving ? "Publishing..." : "Publish opportunity"}</button>
    </form>
  );
}

export default function NewOpportunity() {
  return (
    <main className="container">
      <h1>Publish an opportunity</h1>
      <p><Link href="/provider/opportunities">My opportunities</Link></p>
      <RoleGuard role="provider">{(profile) => <Form profile={profile} />}</RoleGuard>
    </main>
  );
}