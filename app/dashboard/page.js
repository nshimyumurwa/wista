"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "../../components/RoleGuard";
import { supabase } from "../../lib/supabase";

function Activity({ profile }) {
  const [apps, setApps] = useState(null);
  const [saved, setSaved] = useState(null);
  const [notes, setNotes] = useState(null);

  async function load() {
    const a = await supabase.from("applications")
      .select("id, kind, status, submitted_at, opportunities(id, title)")
      .eq("participant_id", profile.id).order("submitted_at", { ascending: false });
    setApps(a.data || []);
    const s = await supabase.from("saved_opportunities")
      .select("opportunity_id, opportunities(id, title, type, location)")
      .eq("user_id", profile.id).order("saved_at", { ascending: false });
    setSaved(s.data || []);
    const n = await supabase.from("notifications").select("*")
      .eq("user_id", profile.id).order("created_at", { ascending: false });
    setNotes(n.data || []);
  }
  useEffect(() => { load(); }, []);

  async function markRead(id) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    load();
  }

  return (
    <>
      <div className="panel">
        <h3>Notifications</h3>
        {!notes ? <p className="meta">Loading...</p> : notes.length === 0 ? <p className="meta">No notifications yet.</p> : (
          notes.map((n) => (
            <p key={n.id} style={{ fontWeight: n.read ? 400 : 700 }}>
              {n.message}{" "}
              {!n.read && <button onClick={() => markRead(n.id)}>Mark as read</button>}
            </p>
          ))
        )}
      </div>
      <div className="panel">
        <h3>My applications and registrations</h3>
        {!apps ? <p className="meta">Loading...</p> : apps.length === 0 ? <p className="meta">You have not applied to anything yet.</p> : (
          apps.map((a) => (
            <p key={a.id}>
              <Link href={"/opportunities/" + (a.opportunities ? a.opportunities.id : "")}>
                {a.opportunities ? a.opportunities.title : "Opportunity"}
              </Link>{" "}
              · {a.kind} · <span className={"badge " + a.status}>{a.status}</span>
            </p>
          ))
        )}
      </div>
      <div className="panel">
        <h3>Saved opportunities</h3>
        {!saved ? <p className="meta">Loading...</p> : saved.length === 0 ? <p className="meta">Nothing saved yet.</p> : (
          saved.map((s) => (
            <p key={s.opportunity_id}>
              {s.opportunities ? (
                <><Link href={"/opportunities/" + s.opportunities.id}>{s.opportunities.title}</Link>
                {" "}· {s.opportunities.type} · {s.opportunities.location}</>
              ) : "Opportunity no longer available"}
            </p>
          ))
        )}
      </div>
    </>
  );
}

export default function ParticipantDashboard() {
  return (
    <RoleGuard role="participant">
      {(profile) => (
        <div className="page">
          <h1>Welcome, {profile.name}</h1>
          <div className="panel">
            <h3>Your profile</h3>
            <p className="meta">
              Sport: {profile.sport || "not set"} | Location: {profile.location || "not set"} |
              Experience: {profile.experience_level || "not set"}
            </p>
            <a className="btn" href="/profile">Edit profile</a>
          </div>
          <div className="panel">
            <h3>Find opportunities</h3>
            <p className="meta">Browse training, competitions, mentorship, scholarships and careers.</p>
            <a className="btn" href="/opportunities">Browse opportunities</a>
          </div>
          <Activity profile={profile} />
        </div>
      )}
    </RoleGuard>
  );
}