"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { homeFor } from "../../lib/useProfile";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("participant");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!name.trim()) return setError("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (role === "provider" && !orgName.trim())
      return setError("Please enter your organization or coaching name.");

    setBusy(true);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim(), role, org_name: role === "provider" ? orgName.trim() : null },
      },
    });
    setBusy(false);

    if (err) return setError(err.message);
    if (data.session) {
      window.location.href = homeFor(role);
    } else {
      setMessage("Account created. Check your email to confirm it, then log in.");
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h1>Create your account</h1>
      <label>
        Full name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <label>
        I am a
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="participant">Participant (looking for opportunities)</option>
          <option value="provider">Opportunity provider (organization, coach or mentor)</option>
        </select>
      </label>
      {role === "provider" && (
        <label>
          Organization or coaching name
          <input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
        </label>
      )}
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <button className="btn" disabled={busy}>{busy ? "Creating..." : "Sign up"}</button>
      <p className="meta">Already have an account? <a href="/login">Log in</a></p>
    </form>
  );
}