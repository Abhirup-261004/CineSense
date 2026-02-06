const API_KEY="";
const BASE_URL='https://api.themoviedb.org/3';

async function tmdbFetch(path) {
  const res = await fetch(`${BASE_URL}${path}${path.includes("?") ? "&" : "?"}api_key=${API_KEY}`);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export const getPopularMovies = async () => {
  const data = await tmdbFetch(`/movie/popular?language=en-US&page=1`);
  return data.results ?? [];
};

export const searchMovies = async (query) => {
  const data = await tmdbFetch(`/search/movie?language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`);
  return data.results ?? [];
};

export const getMovieDetailsBundle = async (movieId, region = "IN") => {
  const [details, credits, videos, providers, similar] = await Promise.all([
    tmdbFetch(`/movie/${movieId}?language=en-US`),
    tmdbFetch(`/movie/${movieId}/credits?language=en-US`),
    tmdbFetch(`/movie/${movieId}/videos?language=en-US`),
    tmdbFetch(`/movie/${movieId}/watch/providers`),
    tmdbFetch(`/movie/${movieId}/similar?language=en-US&page=1`),
  ]);

  const trailer =
    (videos.results ?? []).find((v) => v.type === "Trailer" && v.site === "YouTube") ||
    (videos.results ?? []).find((v) => v.site === "YouTube");

  const providerForRegion = providers.results?.[region] || null;

  return {
    details,
    credits,
    trailer,
    providerForRegion,
    similar: similar.results ?? [],
  };
};

export const getBecauseYouLiked = async (movieId, page=1) =>{
    const rec = await tmdbFetch(`/movie/${movieId}/recommendations?language=en-US&page=${page}`);
    const recommendations = rec.results ?? [];

    //Fallback if TMDB returns no recommendations
    if(recommendations.length >0 ) return recommendations;

    const sim =await tmdbFetch(`/movie/${movieId}/similar?language=en-US&page=${page}`);
    return sim.results ?? [];
};

export const discoverByGenres = async (genreIds, page = 1) => {
  if (!genreIds || genreIds.length === 0) return [];

  const data = await tmdbFetch(
    `/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=${genreIds.join(
      ","
    )}&page=${page}`
  );

  return data.results ?? [];
};

export const generateMovieNightPick = async ({
  genres,
  maxRuntime,
  minRating,
  language
}) => {
  const params = new URLSearchParams({
    language: "en-US",
    sort_by: "popularity.desc",
    include_adult: "false",
    "vote_average.gte": minRating,
    "with_runtime.lte": maxRuntime,
    with_genres: genres.join(","),
    with_original_language: language,
    page: Math.floor(Math.random() * 5) + 1 // randomness
  });

  const data = await tmdbFetch(`/discover/movie?${params.toString()}`);
  return data.results ?? [];
};
