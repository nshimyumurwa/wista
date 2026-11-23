"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export function homeFor(role) {
  if (role === "admin") return "/admin";
  if (role === "provider") return "/provider";
  return "/dashboard";
}

export function useProfile() {
  const [state, setState] = useState({ loading: true, profile: null });

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        if (active) setState({ loading: false, profile: null });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (active) setState({ loading: false, profile: profile || null });
    }
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      setTimeout(load, 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}