"use client";
import { useEffect, useState } from "react";
import RoleGuard from "../../components/RoleGuard";
import { supabase } from "../../lib/supabase";

function Providers() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const { data } = await supabase.from("profiles")
      .select("id, name, email, org_name, verification_status")
      .eq("role", "provider").order("name");
    setItems(data || []);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    setError("");
    const { error } = await supabase.from("profiles").update({ verification_status: status }).eq("id", id);
    if (error) setError(error.message);
    load();
  }

  if (!items) return <p className="meta">Loading...</p>;
  if (items.length === 0) return <p className="meta">No providers have signed up yet.</p>;
  return (
    <>
      {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
      {items.map((p) => (
        <div key={p.id} style={{ marginBottom: 12 }}>
          <b>{p.org_name || p.name}</b> ({p.email}){" "}
          <span className={"badge " + p.verification_status}>{p.verification_status}</span>{" "}
          {p.verification_status !== "verified" && <button onClick={() => setStatus(p.id, "verified")}>Verify</button>}{" "}
          {p.verification_status !== "rejected" && <button onClick={() => setStatus(p.id, "rejected")}>Reject</button>}
        </div>
      ))}
    </>
  );
}

export default function AdminDashboard() {
  return (
    <RoleGuard role="admin">
      {(profile) => (
        <div className="page">
          <h1>Administrator dashboard</h1>
          <div className="panel">
            <h3>Signed in as {profile.name}</h3>
          </div>
          <div className="panel">
            <h3>Provider verification</h3>
            <Providers />
          </div>
        </div>
      )}
    </RoleGuard>
  );
}