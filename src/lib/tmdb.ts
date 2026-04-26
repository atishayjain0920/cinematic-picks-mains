// TMDB API Configuration
// Note: For production, you should use an environment variable
const TMDB_API_KEY = "2dca580c2a14b55200e784d157207b4d"; // Public demo key
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export interface Movie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: "movie" | "tv";
  popularity: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  runtime?: number;
  episode_run_time?: number[];
  genres: Genre[];
  tagline?: string;
  status: string;
  budget?: number;
  revenue?: number;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  videos?: {
    results: { key: string; type: string; site: string }[];
  };
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; profile_path: string | null }[];
  };
  similar?: {
    results: Movie[];
  };
}

export const GENRES: Genre[] = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 53, name: "Thriller" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 27, name: "Horror" },
  { id: 16, name: "Animation" },
  { id: 12, name: "Adventure" },
  { id: 80, name: "Crime" },
];

export const getImageUrl = (path: string | null, size: "w200" | "w300" | "w500" | "w780" | "original" = "w500"): string => {
  if (!path) return "/placeholder.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status}`);
  }
  return response.json();
}

export async function getTrending(mediaType: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "week"): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>(`/trending/${mediaType}/${timeWindow}`);
  return data.results;
}

export async function getPopular(mediaType: "movie" | "tv" = "movie"): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>(`/${mediaType}/popular`);
  return data.results.map(item => ({ ...item, media_type: mediaType }));
}

export async function getTopRated(mediaType: "movie" | "tv" = "movie"): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>(`/${mediaType}/top_rated`);
  return data.results.map(item => ({ ...item, media_type: mediaType }));
}

export async function getNowPlaying(): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>("/movie/now_playing");
  return data.results.map(item => ({ ...item, media_type: "movie" }));
}

export async function getUpcoming(): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>("/movie/upcoming");
  return data.results.map(item => ({ ...item, media_type: "movie" }));
}

export async function searchMulti(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  const data = await fetchTMDB<{ results: Movie[] }>("/search/multi", { query });
  return data.results.filter(item => item.media_type === "movie" || item.media_type === "tv");
}

export async function getMoviesByGenre(genreId: number, mediaType: "movie" | "tv" = "movie"): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>(`/discover/${mediaType}`, {
    with_genres: genreId.toString(),
    sort_by: "popularity.desc",
  });
  return data.results.map(item => ({ ...item, media_type: mediaType }));
}

export async function getMovieDetails(id: number, mediaType: "movie" | "tv" = "movie"): Promise<MovieDetails> {
  const data = await fetchTMDB<MovieDetails>(`/${mediaType}/${id}`, {
    append_to_response: "videos,credits,similar",
  });
  return { ...data, media_type: mediaType };
}

export async function getRecommendations(id: number, mediaType: "movie" | "tv" = "movie"): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>(`/${mediaType}/${id}/recommendations`);
  return data.results.map(item => ({ ...item, media_type: mediaType }));
}

export async function getSimilar(id: number, mediaType: "movie" | "tv" = "movie"): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: Movie[] }>(`/${mediaType}/${id}/similar`);
  return data.results.map(item => ({ ...item, media_type: mediaType }));
}
