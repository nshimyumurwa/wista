"use client";
import RoleGuard from "../../components/RoleGuard";

export default function ProviderDashboard() {
  return (
    <RoleGuard role="provider">
      {(profile) => (
        <div className="page">
          <h1>Provider dashboard</h1>
          <div className="panel">
            <h3>{profile.org_name || profile.name}</h3>
            <p>
              Verification status:{" "}
              <span className={"badge " + profile.verification_status}>
                {profile.verification_status}
              </span>
            </p>
            {profile.verification_status === "verified" ? (
              <p className="meta">You can publish opportunities.</p>
            ) : (
              <p className="meta">
                You can publish opportunities once an administrator verifies your account.
              </p>
            )}
            <a className="btn" href="/profile">Edit provider profile</a>
          </div>
        </div>
      )}
    </RoleGuard>
  );
}