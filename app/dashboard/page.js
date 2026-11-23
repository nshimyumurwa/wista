"use client";
import RoleGuard from "../../components/RoleGuard";

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
            <a className="btn" href="/">Browse opportunities</a>
          </div>
        </div>
      )}
    </RoleGuard>
  );
}