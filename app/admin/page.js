"use client";
import RoleGuard from "../../components/RoleGuard";

export default function AdminDashboard() {
  return (
    <RoleGuard role="admin">
      {(profile) => (
        <div className="page">
          <h1>Administrator dashboard</h1>
          <div className="panel">
            <h3>Signed in as {profile.name}</h3>
            <p className="meta">Provider verification, user management and reports will appear here.</p>
          </div>
        </div>
      )}
    </RoleGuard>
  );
}