"use client";
import { useState } from "react";
import RoleGuard from "../../components/RoleGuard";
import { supabase } from "../../lib/supabase";

function ProfileForm({ profile }) {
  const [values, setValues] = useState({
    name: profile.name || "",
    sport: profile.sport || "",
    location: profile.location || "",
    experience_level: profile.experience_level || "",
    interests: profile.interests || "",
    goals: profile.goals || "",
    org_name: profile.org_name || "",
    bio: profile.bio || "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setValues({ ...values, [key]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!values.name.trim()) return setError("Name cannot be empty.");

    let update = { name: values.name.trim() };
    if (profile.role === "participant") {
      update = {
        ...update,
        sport: values.sport,
        location: values.location,
        experience_level: values.experience_level,
        interests: values.interests,
        goals: values.goals,
      };
    } else if (profile.role === "provider") {
      if (!values.org_name.trim()) return setError("Organization name cannot be empty.");
      update = { ...update, org_name: values.org_name.trim(), bio: values.bio };
    }

    setBusy(true);
    const { error: err } = await supabase.from("profiles").update(update).eq("id", profile.id);
    setBusy(false);
    if (err) setError("Could not save your profile: " + err.message);
    else setMessage("Profile saved.");
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h1>{profile.role === "provider" ? "Provider profile" : "My profile"}</h1>
      <label>
        Full name
        <input value={values.name} onChange={set("name")} />
      </label>
      <label>
        Email
        <input value={profile.email} disabled />
      </label>

      {profile.role === "participant" && (
        <>
          <label>
            Sport
            <input value={values.sport} onChange={set("sport")} placeholder="e.g. Football, Basketball" />
          </label>
          <label>
            Location
            <input value={values.location} onChange={set("location")} placeholder="e.g. Kigali" />
          </label>
          <label>
            Experience level
            <select value={values.experience_level} onChange={set("experience_level")}>
              <option value="">Select...</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
          <label>
            Interests
            <textarea rows={3} value={values.interests} onChange={set("interests")} />
          </label>
          <label>
            Goals
            <textarea rows={3} value={values.goals} onChange={set("goals")} />
          </label>
        </>
      )}

      {profile.role === "provider" && (
        <>
          <label>
            Organization or coaching name
            <input value={values.org_name} onChange={set("org_name")} />
          </label>
          <label>
            About you or your organization
            <textarea rows={4} value={values.bio} onChange={set("bio")} />
          </label>
          <p>
            Verification status:{" "}
            <span className={"badge " + profile.verification_status}>{profile.verification_status}</span>
          </p>
        </>
      )}

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <button className="btn" disabled={busy}>{busy ? "Saving..." : "Save profile"}</button>
    </form>
  );
}

export default function ProfilePage() {
  return <RoleGuard>{(profile) => <ProfileForm profile={profile} />}</RoleGuard>;
}