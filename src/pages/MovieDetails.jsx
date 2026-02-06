import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovieDetailsBundle } from "../services/api";
import MovieCard from "../components/MovieCard";
import "../css/MovieDetails.css";

function minutesToHrs(min) {
  if (!min && min !== 0) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export default function MovieDetails() {
  const { id } = useParams();
  const region = "IN"; // change to "US", "GB", etc if you want
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [details, setDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [providerForRegion, setProviderForRegion] = useState(null);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const bundle = await getMovieDetailsBundle(id, region);

        if (!alive) return;
        setDetails(bundle.details);
        setCredits(bundle.credits);
        setTrailer(bundle.trailer);
        setProviderForRegion(bundle.providerForRegion);
        setSimilar(bundle.similar);
      } catch (e) {
        console.log(e);
        if (!alive) return;
        setError("Failed to load movie details.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  const backdropUrl = useMemo(() => {
    if (!details?.backdrop_path) return null;
    return `https://image.tmdb.org/t/p/original${details.backdrop_path}`;
  }, [details]);

  const posterUrl = useMemo(() => {
    if (!details?.poster_path) return "https://via.placeholder.com/500x750?text=No+Poster";
    return `https://image.tmdb.org/t/p/w500${details.poster_path}`;
  }, [details]);

  const castTop = (credits?.cast ?? []).slice(0, 12);

  const providers = providerForRegion?.flatrate ?? [];
  const providersRent = providerForRegion?.rent ?? [];
  const providersBuy = providerForRegion?.buy ?? [];
  const tmdbWatchLink = providerForRegion?.link;

  if (loading) return <div className="details-loading">Loading...</div>;
  if (error) return <div className="details-error">{error}</div>;
  if (!details) return <div className="details-error">Movie not found.</div>;

  return (
    <div className="details-page">
      {/* Backdrop */}
      <div className="details-hero" style={backdropUrl ? { backgroundImage: `url(${backdropUrl})` } : undefined}>
        <div className="details-hero-overlay">
          <div className="details-hero-content">
            <Link className="details-back" to="/">← Back</Link>

            <div className="details-main">
              <img className="details-poster" src={posterUrl} alt={details.title} />

              <div className="details-meta">
                <h1 className="details-title">
                  {details.title}{" "}
                  <span className="details-year">
                    ({details.release_date ? details.release_date.split("-")[0] : "—"})
                  </span>
                </h1>

                <div className="details-sub">
                  <span>⭐ {details.vote_average?.toFixed(1) ?? "—"}</span>
                  <span>•</span>
                  <span>{minutesToHrs(details.runtime)}</span>
                  <span>•</span>
                  <span>{details.original_language?.toUpperCase() ?? "—"}</span>
                </div>

                <div className="details-genres">
                  {(details.genres ?? []).map((g) => (
                    <span className="genre-pill" key={g.id}>{g.name}</span>
                  ))}
                </div>

                <p className="details-overview">{details.overview || "No overview available."}</p>

                {/* Trailer */}
                {trailer?.key ? (
                  <div className="details-trailer">
                    <h2>Trailer</h2>
                    <div className="trailer-frame">
                      <iframe
                        title="Trailer"
                        src={`https://www.youtube.com/embed/${trailer.key}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <div className="details-trailer">
                    <h2>Trailer</h2>
                    <p className="muted">No trailer found.</p>
                  </div>
                )}

                {/* Providers */}
                <div className="details-providers">
                  <h2>Where to watch ({region})</h2>

                  {tmdbWatchLink ? (
                    <a className="provider-link" href={tmdbWatchLink} target="_blank" rel="noreferrer">
                      View on TMDB →
                    </a>
                  ) : (
                    <p className="muted">No provider link available.</p>
                  )}

                  <div className="provider-groups">
                    <ProviderRow title="Stream" items={providers} />
                    <ProviderRow title="Rent" items={providersRent} />
                    <ProviderRow title="Buy" items={providersBuy} />
                  </div>
                </div>
              </div>
            </div>

            {/* Cast */}
            <section className="details-section">
              <h2>Top Cast</h2>
              {castTop.length === 0 ? (
                <p className="muted">No cast info available.</p>
              ) : (
                <div className="cast-grid">
                  {castTop.map((p) => (
                    <div className="cast-card" key={p.cast_id || p.credit_id}>
                      <img
                        className="cast-img"
                        src={
                          p.profile_path
                            ? `https://image.tmdb.org/t/p/w185${p.profile_path}`
                            : "https://via.placeholder.com/185x278?text=No+Photo"
                        }
                        alt={p.name}
                      />
                      <div className="cast-text">
                        <div className="cast-name">{p.name}</div>
                        <div className="cast-role muted">{p.character}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Similar */}
            <section className="details-section">
              <h2>Similar Movies</h2>
              {similar.length === 0 ? (
                <p className="muted">No similar movies found.</p>
              ) : (
                <div className="similar-grid">
                  {similar.slice(0, 12).map((m) => (
                    <MovieCard key={m.id} movie={m} />
                  ))}
                </div>
              )}
            </section>


          </div>
        </div>
      </div>
    </div>
  );
}

function ProviderRow({ title, items }) {
  if (!items || items.length === 0) {
    return (
      <div className="provider-row">
        <div className="provider-title">{title}</div>
        <div className="muted">—</div>
      </div>
    );
  }

  return (
    <div className="provider-row">
      <div className="provider-title">{title}</div>
      <div className="provider-icons">
        {items.slice(0, 8).map((p) => (
          <img
            key={p.provider_id}
            className="provider-icon"
            src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
            title={p.provider_name}
            alt={p.provider_name}
          />
        ))}
      </div>
    </div>
  );
}
