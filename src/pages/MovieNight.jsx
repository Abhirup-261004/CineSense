import { useState } from "react";
import { generateMovieNightPick } from "../services/api";
import MovieCard from "../components/MovieCard";
import "../css/MovieNight.css";

const MOODS = {
  chill: { label: "Chill 😌", genres: [35, 10749] },
  dark: { label: "Dark 🖤", genres: [53, 27, 9648] },
  mindbend: { label: "Mind-bending 🧠", genres: [878, 9648] },
  action: { label: "Action 🔥", genres: [28, 12] },
  emotional: { label: "Emotional 💔", genres: [18] }
};

function MovieNight() {
  const [mood, setMood] = useState("chill");
  const [runtime, setRuntime] = useState(120);
  const [rating, setRating] = useState(7);
  const [language, setLanguage] = useState("en");
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    try {
      setLoading(true);
      const results = await generateMovieNightPick({
        genres: MOODS[mood].genres,
        maxRuntime: runtime,
        minRating: rating,
        language
      });

      if (results.length > 0) {
        const randomPick = results[Math.floor(Math.random() * results.length)];
        setMovie(randomPick);
      } else {
        setMovie(null);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movie-night">
      <h1>🎬 Movie Night Generator</h1>

      <div className="generator-panel">
        <label>
          Mood
          <select value={mood} onChange={(e) => setMood(e.target.value)}>
            {Object.entries(MOODS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </label>

        <label>
          Time Available (minutes)
          <input
            type="number"
            value={runtime}
            onChange={(e) => setRuntime(e.target.value)}
          />
        </label>

        <label>
          Minimum Rating
          <input
            type="number"
            step="0.5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </label>

        <label>
          Language
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="fr">French</option>
            <option value="ko">Korean</option>
          </select>
        </label>

        <button onClick={generate} disabled={loading}>
          {loading ? "Picking..." : "Pick a Movie 🍿"}
        </button>
      </div>

      {movie && (
        <div className="movie-night-result">
          <h2>Tonight’s Pick</h2>
          <MovieCard movie={movie} />
          <button className="regen" onClick={generate}>Pick Another 🎲</button>
        </div>
      )}
    </div>
  );
}

export default MovieNight;
