"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "../../../components/RoleGuard";
import { supabase } from "../../../lib/supabase";

function List() {
  const [items, setItems] = useState(null);

  async function load() {
    const { data } = await supabase.from("applications")
      .select("id, kind, status, submitted_at, opportunities(title), profiles(name, email, sport, location)")
      .order("submitted_at", { ascending: false });
    setItems(data || []);
  }
  useEffect(() => { load(); }, []);

  async function decide(id, status) {
    await supabase.from("applications").update({ status }).eq("id", id);
    load();
  }

  if (!items) return <p className="empty">Loading...</p>;
  if (items.length === 0) return <p className="empty">No applications or registrations yet.</p>;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((a) => (
        <div key={a.id} className="card">
          <h3>{a.opportunities ? a.opportunities.title : "Opportunity"}</h3>
          <p>
            {a.profiles ? a.profiles.name : "Participant"}
            {a.profiles && a.profiles.email ? " (" + a.profiles.email + ")" : ""}
            {a.profiles && a.profiles.sport ? " · " + a.profiles.sport : ""}
            {a.profiles && a.profiles.location ? " · " + a.profiles.location : ""}
          </p>
          <p>{a.kind} · <span className={"badge " + a.status}>{a.status}</span></p>
          {a.status === "pending" && (
            <p style={{ display: "flex", gap: 8 }}>
              <button onClick={() => decide(a.id, "accepted")}>Accept</button>
              <button onClick={() => decide(a.id, "rejected")}>Reject</button>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Applicants() {
  return (
    <main className="container">
      <h1>Applicants</h1>
      <p><Link href="/provider">← Provider dashboard</Link></p>
      <RoleGuard role="provider">{() => <List />}</RoleGuard>
    </main>
  );
}