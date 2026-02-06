import { useEffect, useMemo, useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { discoverByGenres } from "../services/api";
import MovieCard from "./MovieCard";
import "../css/BecauseYouLiked.css";

export default function BecauseYouLikedFromAllFavorites() {
  const { favorites } = useMovieContext();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1️⃣ Extract and rank genres from favorites
  const topGenreIds = useMemo(() => {
    if (!favorites.length) return [];

    const freq = {};
    favorites.forEach((movie) => {
      movie.genre_ids?.forEach((id) => {
        freq[id] = (freq[id] || 0) + 1;
      });
    });

    // sort genres by frequency
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // take top 3 genres
      .map(([id]) => id);
  }, [favorites]);

  useEffect(() => {
    if (topGenreIds.length === 0) return;

    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const discovered = await discoverByGenres(topGenreIds);

        if (!alive) return;

        // remove already-favorited movies
        const favIds = new Set(favorites.map((m) => m.id));
        const filtered = discovered.filter((m) => !favIds.has(m.id));

        setMovies(filtered);
      } catch (e) {
        console.log(e);
        if (!alive) return;
        setError("Failed to load recommendations.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [topGenreIds.join(","), favorites]);

  if (!favorites.length) return null;

  return (
    <section className="byl-section">
      <h2 className="byl-title">Because you liked your favorites</h2>

      {loading && <div className="byl-loading">Loading recommendations…</div>}
      {error && <div className="byl-error">{error}</div>}

      {!loading && !error && movies.length === 0 && (
        <div className="byl-empty">No recommendations found.</div>
      )}

      {!loading && !error && movies.length > 0 && (
        <div className="byl-grid">
          {movies.slice(0, 12).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}
