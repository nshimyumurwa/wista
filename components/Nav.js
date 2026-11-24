"use client";
import { useProfile, homeFor } from "../lib/useProfile";
import { supabase } from "../lib/supabase";

export default function Nav() {
  const { loading, profile } = useProfile();

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav>
      <a href="/opportunities">Opportunities</a>
      {!loading && !profile && (
        <>
          <a href="/login">Log in</a>
          <a href="/signup" className="btn">Sign up</a>
        </>
      )}
      {profile && (
        <>
          <a href={homeFor(profile.role)}>Dashboard</a>
          <a href="/profile">Profile</a>
          <button className="linkbtn" onClick={logout}>Log out</button>
        </>
      )}
    </nav>
  );
}