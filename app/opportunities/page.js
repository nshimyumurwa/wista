"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const TYPES = ["training", "competition", "mentorship", "scholarship", "internship", "career"];

export default function Opportunities() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    supabase.from("opportunities").select("*").eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems(data || []));
  }, []);

  const shown = useMemo(() => {
    if (!items) return [];
    const s = q.trim().toLowerCase();
    return items.filter((o) =>
      (!s || o.title.toLowerCase().includes(s) || o.sport.toLowerCase().includes(s)) &&
      (!type || o.type === type) &&
      (!location || o.location.toLowerCase().includes(location.trim().toLowerCase())) &&
      (!level || o.experience_level === level)
    );
  }, [items, q, type, location, level]);

  return (
    <main className="container">
      <h1>Opportunities</h1>
      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <input placeholder="Search by title or sport" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All levels</option>
          <option>Beginner</option><option>Intermediate</option>
          <option>Advanced</option><option>All levels</option>
        </select>
      </div>
      {!items && <p className="empty">Loading...</p>}
      {items && shown.length === 0 && <p className="empty">No opportunities match your search.</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {shown.map((o) => (
          <div key={o.id} className="card">
            <h3><Link href={"/opportunities/" + o.id}>{o.title}</Link></h3>
            <p>{o.type} · {o.sport} · {o.location}{o.experience_level ? " · " + o.experience_level : ""}</p>
            {o.deadline && <p>Deadline: {o.deadline}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}