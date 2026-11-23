"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile, homeFor } from "../lib/useProfile";

// Shows the page only to the right role. Others are redirected.
export default function RoleGuard({ role, children }) {
  const { loading, profile } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!profile) router.replace("/login");
    else if (role && profile.role !== role) router.replace(homeFor(profile.role));
  }, [loading, profile, role, router]);

  if (loading || !profile || (role && profile.role !== role)) {
    return <p className="empty">Loading...</p>;
  }
  return children(profile);
}