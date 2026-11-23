"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "../../../components/RoleGuard";
import { supabase } from "../../../lib/supabase";

function List({ profile }) {
  const [items, setItems] = useState(null);

  async function load() {
    const { data } = await supabase
      .from("opportunities").select("*")
      .eq("provider_id", profile.id).order("created_at", { ascending: false });
    setItems(data || []);
  }
  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm("Remove this opportunity from the public list?")) return;
    await supabase.from("opportunities").update({ status: "removed" }).eq("id", id);
    load();
  }

  if (!items) return <p className="empty">Loading...</p>;
  if (items.length === 0) return <p className="empty">You have not published anything yet.</p>;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((o) => (
        <div key={o.id} className="card">
          <h3><Link href={"/opportunities/" + o.id}>{o.title}</Link></h3>
          <p>{o.type} · {o.sport} · {o.location} · <b>{o.status}</b></p>
          {o.status === "published" && <button onClick={() => remove(o.id)}>Remove</button>}
        </div>
      ))}
    </div>
  );
}

export default function MyOpportunities() {
  return (
    <main className="container">
      <h1>My opportunities</h1>
      <p><Link href="/provider/new">+ Publish new</Link></p>
      <RoleGuard role="provider">{(profile) => <List profile={profile} />}</RoleGuard>
    </main>
  );
}