"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "../../components/RoleGuard";
import { supabase } from "../../lib/supabase";

function Panel() {
  const [tab, setTab] = useState("providers");
  const [users, setUsers] = useState(null);
  const [opps, setOpps] = useState(null);
  const [reports, setReports] = useState(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const p = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(p.data || []);
    const o = await supabase
      .from("opportunities")
      .select("id,title,type,location,status,profiles(name,org_name)")
      .order("created_at", { ascending: false });
    setOpps(o.data || []);
    const r = await supabase
      .from("reports")
      .select("id,reason,status,created_at,opportunity_id,opportunities(title,status),profiles(name)")
      .order("created_at", { ascending: false });
    if (r.error) setMsg("Could not load reports: " + r.error.message);
    setReports(r.data || []);
  }
  useEffect(() => { load(); }, []);

  async function setVerification(id, status) {
    const { error } = await supabase.from("profiles").update({ verification_status: status }).eq("id", id);
    setMsg(error ? error.message : "Provider marked " + status + ".");
    load();
  }

  async function setListing(id, status) {
    const { error } = await supabase.from("opportunities").update({ status }).eq("id", id);
    setMsg(error ? error.message : "Listing is now " + status + ".");
    load();
  }

  async function resolve(report, remove) {
    if (remove) await supabase.from("opportunities").update({ status: "removed" }).eq("id", report.opportunity_id);
    await supabase.from("reports").update({ status: remove ? "resolved" : "dismissed" }).eq("id", report.id);
    setMsg(remove ? "Listing removed and report resolved." : "Report dismissed.");
    load();
  }

  const providers = (users || []).filter((u) => u.role === "provider");
  const openReports = (reports || []).filter((r) => r.status === "open");

  return (
    <div className="page">
      <h1>Administrator dashboard</h1>
      <p>
        <button className="btn" onClick={() => setTab("providers")}>Providers</button>{" "}
        <button className="btn" onClick={() => setTab("users")}>Users</button>{" "}
        <button className="btn" onClick={() => setTab("opps")}>Opportunities</button>{" "}
        <button className="btn" onClick={() => setTab("reports")}>Reports ({openReports.length})</button>
      </p>
      {msg && <p className="success">{msg}</p>}

      {tab === "providers" && (
        <div>
          <h2>Provider verification</h2>
          {providers.length === 0 && <p className="empty">No providers yet.</p>}
          {providers.map((p) => (
            <div className="panel" key={p.id}>
              <h3>{p.org_name || p.name}</h3>
              <p className="meta">{p.name} | {p.email}</p>
              {p.bio && <p>{p.bio}</p>}
              <p>Status: <span className={"badge " + p.verification_status}>{p.verification_status}</span></p>
              <button className="btn" onClick={() => setVerification(p.id, "verified")}>Verify</button>{" "}
              <button className="linkbtn" onClick={() => setVerification(p.id, "rejected")}>Reject</button>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div>
          <h2>All users</h2>
          {(users || []).map((u) => (
            <div className="panel" key={u.id}>
              <h3>{u.name}</h3>
              <p className="meta">{u.email} | {u.role}{u.verification_status ? " | " + u.verification_status : ""}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "opps" && (
        <div>
          <h2>Opportunity listings</h2>
          {(opps || []).length === 0 && <p className="empty">No listings yet.</p>}
          {(opps || []).map((o) => (
            <div className="panel" key={o.id}>
              <h3><Link href={"/opportunities/" + o.id}>{o.title}</Link></h3>
              <p className="meta">
                {o.type} | {o.location} | by {o.profiles?.org_name || o.profiles?.name} | <b>{o.status}</b>
              </p>
              {o.status === "published" ? (
                <button className="linkbtn" onClick={() => setListing(o.id, "removed")}>Remove</button>
              ) : (
                <button className="btn" onClick={() => setListing(o.id, "published")}>Restore</button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "reports" && (
        <div>
          <h2>Reported content</h2>
          {(reports || []).length === 0 && <p className="empty">No reports yet.</p>}
          {(reports || []).map((r) => (
            <div className="panel" key={r.id}>
              <h3><Link href={"/opportunities/" + r.opportunity_id}>{r.opportunities?.title || "Opportunity"}</Link></h3>
              <p>Reason: {r.reason}</p>
              <p className="meta">Reported by {r.profiles?.name} | <b>{r.status}</b></p>
              {r.status === "open" && (
                <>
                  <button className="btn" onClick={() => resolve(r, true)}>Remove listing</button>{" "}
                  <button className="linkbtn" onClick={() => resolve(r, false)}>Dismiss</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return <RoleGuard role="admin">{() => <Panel />}</RoleGuard>;
}