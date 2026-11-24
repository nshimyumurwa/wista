"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { useProfile } from "../../../lib/useProfile";

export default function Details() {
  const { id } = useParams();
  const { profile } = useProfile();
  const [o, setO] = useState(undefined);

  useEffect(() => {
    supabase.from("opportunities").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => setO(data));
  }, [id]);

  if (o === undefined) return <main className="container"><p className="empty">Loading...</p></main>;
  if (o === null) return <main className="container"><p className="empty">Opportunity not found.</p></main>;

  const label = o.allows_registration ? "Register" : "Apply";
  return (
    <main className="container">
      <p><Link href="/opportunities">← Back to opportunities</Link></p>
      <h1>{o.title}</h1>
      <p>{o.type} · {o.sport} · {o.location}{o.experience_level ? " · " + o.experience_level : ""}</p>
      <div className="card">
        <h3>Description</h3><p>{o.description}</p>
        {o.eligibility && (<><h3>Eligibility</h3><p>{o.eligibility}</p></>)}
        {o.start_date && <p>Starts: {o.start_date}</p>}
        {o.end_date && <p>Ends: {o.end_date}</p>}
        {o.deadline && <p>Deadline: {o.deadline}</p>}
      </div>
      <p style={{ marginTop: 16 }}>
        {!profile ? (
          <Link href="/login">Log in to {label.toLowerCase()}</Link>
        ) : profile.role === "participant" ? (
          <button disabled>{label} (coming in the next update)</button>
        ) : null}
      </p>
    </main>
  );
}