"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { homeFor } from "../../lib/useProfile";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("Please enter your email and password.");

    setBusy(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setBusy(false);
      return setError("Incorrect email or password. Please check your details and try again.");
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    window.location.href = homeFor(profile?.role);
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h1>Log in</h1>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? "Logging in..." : "Log in"}</button>
      <p className="meta">New to WISTA? <a href="/signup">Create an account</a></p>
    </form>
  );
}