import { useMemo } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import "../css/TasteProfile.css";

function TasteProfile() {
  const { favorites } = useMovieContext();

  const stats = useMemo(() => {
    if (!favorites.length) return null;

    const genreCount = {};
    const decadeCount = {};
    const languageCount = {};
    let ratingSum = 0;

    favorites.forEach((movie) => {
      ratingSum += movie.vote_average || 0;

      // Genres
    const ids =
        Array.isArray(movie.genre_ids)
            ? movie.genre_ids
            : Array.isArray(movie.genres)
            ? movie.genres.map((g) => g.id)
            : [];

    ids.forEach((id) => {
    genreCount[id] = (genreCount[id] || 0) + 1;
    });

      // Decades
      if (movie.release_date) {
        const year = parseInt(movie.release_date.slice(0, 4));
        const decade = `${Math.floor(year / 10) * 10}s`;
        decadeCount[decade] = (decadeCount[decade] || 0) + 1;
      }

      // Languages
      if (movie.original_language) {
        languageCount[movie.original_language] =
          (languageCount[movie.original_language] || 0) + 1;
      }
    });

    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topDecades = Object.entries(decadeCount).sort((a, b) => b[1] - a[1]);
    const topLanguages = Object.entries(languageCount).sort((a, b) => b[1] - a[1]);

    return {
      total: favorites.length,
      avgRating: (ratingSum / favorites.length).toFixed(1),
      topGenres,
      topDecades,
      topLanguages
    };
  }, [favorites]);

  if (!favorites.length) {
    return (
      <div className="taste-empty">
        <h2>No Taste Profile Yet</h2>
        <p>Add movies to favorites to build your profile.</p>
      </div>
    );
  }

  return (
    <div className="taste-profile">
      <h1>🎭 Your Taste Profile</h1>

      <div className="taste-cards">
        <StatCard title="Favorites" value={stats.total} />
        <StatCard title="Avg Rating" value={`⭐ ${stats.avgRating}`} />
      </div>

      <section>
        <h2>Top Genres</h2>
        <div className="pill-row">
          {stats.topGenres.map(([id, count]) => (
            <span key={id} className="pill">
              Genre {id} · {count}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2>Preferred Decades</h2>
        <div className="pill-row">
          {stats.topDecades.map(([decade, count]) => (
            <span key={decade} className="pill">
              {decade} · {count}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2>Languages You Watch</h2>
        <div className="pill-row">
          {stats.topLanguages.map(([lang, count]) => (
            <span key={lang} className="pill">
              {lang.toUpperCase()} · {count}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2>Your Favorites</h2>
        <div className="taste-movies">
          {favorites.slice(0, 8).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="taste-stat">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default TasteProfile;
