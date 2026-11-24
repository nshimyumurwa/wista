import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select("id, title, type, sport, location, start_date")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <>
      <section className="hero">
        <h1>Find your next sports opportunity in Rwanda</h1>
        <p>
          Training, competitions, mentorship, scholarships, internships and careers for women and
          girls, all in one place. No account needed to browse.
        </p>
        <p><a className="btn" href="/opportunities">Search all opportunities</a></p>
      </section>

      {error && <p className="empty">We could not load opportunities. Check your Supabase settings and try again.</p>}

      {!error && opportunities?.length === 0 && (
        <p className="empty">No opportunities have been published yet. Check back soon.</p>
      )}

      <div className="grid">
        {opportunities?.map((o) => (
          <article className="card" key={o.id}>
            <span className="tag">{o.type}</span>
            <h3><a href={`/opportunities/${o.id}`}>{o.title}</a></h3>
            <p className="meta">{o.sport} &middot; {o.location}</p>
          </article>
        ))}
      </div>
    </>
  );
}