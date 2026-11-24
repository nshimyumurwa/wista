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
  const [app, setApp] = useState(null);
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const isParticipant = !!profile && profile.role === "participant";
  const pid = profile ? profile.id : null;

  useEffect(() => {
    supabase.from("opportunities").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => setO(data));
  }, [id]);

  useEffect(() => {
    if (!pid || !isParticipant) return;
    supabase.from("applications").select("*")
      .eq("participant_id", pid).eq("opportunity_id", id).maybeSingle()
      .then(({ data }) => setApp(data));
    supabase.from("saved_opportunities").select("opportunity_id")
      .eq("user_id", pid).eq("opportunity_id", id).maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [pid, isParticipant, id]);

  if (o === undefined) return <main className="container"><p className="empty">Loading...</p></main>;
  if (o === null) return <main className="container"><p className="empty">Opportunity not found.</p></main>;

  const label = o.allows_registration ? "Register" : "Apply";
  const today = new Date().toISOString().slice(0, 10);
  const closed = o.deadline && today > o.deadline;

  async function submitRequest() {
    setMsg(""); setBusy(true);
    const { data, error } = await supabase.from("applications").insert({
      participant_id: pid, opportunity_id: id,
      kind: o.allows_registration ? "register" : "apply",
    }).select("*").single();
    setBusy(false);
    if (error) { setMsg(error.code === "23505" ? "You have already submitted this." : error.message); return; }
    setApp(data);
    setMsg(label + " submitted successfully.");
  }

  async function toggleSave() {
    setMsg("");
    if (saved) {
      await supabase.from("saved_opportunities").delete().eq("user_id", pid).eq("opportunity_id", id);
      setSaved(false);
    } else {
      const { error } = await supabase.from("saved_opportunities").insert({ user_id: pid, opportunity_id: id });
      if (error) { setMsg(error.message); return; }
      setSaved(true);
    }
  }

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
      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        {!profile ? (
          <Link href="/login">Log in to {label.toLowerCase()}</Link>
        ) : isParticipant ? (
          <>
            {app ? (
              <span className={"badge " + app.status}>{label} status: {app.status}</span>
            ) : (
              <button onClick={submitRequest} disabled={busy || closed}>
                {closed ? "Deadline passed" : busy ? "Submitting..." : label}
              </button>
            )}
            <button onClick={toggleSave}>{saved ? "Saved ✓ (click to unsave)" : "Save for later"}</button>
          </>
        ) : null}
      </div>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  );
}