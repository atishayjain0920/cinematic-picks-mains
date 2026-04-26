import { useQuery } from "@tanstack/react-query";
import {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getUpcoming,
  searchMulti,
  getMoviesByGenre,
  getMovieDetails,
  getRecommendations,
  getSimilar,
  Movie,
  MovieDetails,
} from "@/lib/tmdb";
import { getFavorites, getHistory, UserMediaItem } from "@/lib/api";

export function useTrending(mediaType: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "week") {
  return useQuery<Movie[]>({
    queryKey: ["trending", mediaType, timeWindow],
    queryFn: () => getTrending(mediaType, timeWindow),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function usePopular(mediaType: "movie" | "tv" = "movie") {
  return useQuery<Movie[]>({
    queryKey: ["popular", mediaType],
    queryFn: () => getPopular(mediaType),
    staleTime: 1000 * 60 * 10,
  });
}

export function useTopRated(mediaType: "movie" | "tv" = "movie") {
  return useQuery<Movie[]>({
    queryKey: ["topRated", mediaType],
    queryFn: () => getTopRated(mediaType),
    staleTime: 1000 * 60 * 10,
  });
}

export function useNowPlaying() {
  return useQuery<Movie[]>({
    queryKey: ["nowPlaying"],
    queryFn: getNowPlaying,
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpcoming() {
  return useQuery<Movie[]>({
    queryKey: ["upcoming"],
    queryFn: getUpcoming,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSearch(query: string) {
  return useQuery<Movie[]>({
    queryKey: ["search", query],
    queryFn: () => searchMulti(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMoviesByGenre(genreId: number, mediaType: "movie" | "tv" = "movie") {
  return useQuery<Movie[]>({
    queryKey: ["genre", genreId, mediaType],
    queryFn: () => getMoviesByGenre(genreId, mediaType),
    staleTime: 1000 * 60 * 10,
  });
}

export function useMovieDetails(id: number | null, mediaType: "movie" | "tv" = "movie") {
  return useQuery<MovieDetails>({
    queryKey: ["details", id, mediaType],
    queryFn: () => getMovieDetails(id!, mediaType),
    enabled: id !== null,
    staleTime: 1000 * 60 * 30,
  });
}

export function useRecommendations(id: number | null, mediaType: "movie" | "tv" = "movie") {
  return useQuery<Movie[]>({
    queryKey: ["recommendations", id, mediaType],
    queryFn: () => getRecommendations(id!, mediaType),
    enabled: id !== null,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSimilar(id: number | null, mediaType: "movie" | "tv" = "movie") {
  return useQuery<Movie[]>({
    queryKey: ["similar", id, mediaType],
    queryFn: () => getSimilar(id!, mediaType),
    enabled: id !== null,
    staleTime: 1000 * 60 * 10,
  });
}

export function useUserFavorites(enabled = true) {
  return useQuery<UserMediaItem[]>({
    queryKey: ["userFavorites"],
    queryFn: getFavorites,
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUserHistory(enabled = true) {
  return useQuery<UserMediaItem[]>({
    queryKey: ["userHistory"],
    queryFn: getHistory,
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}
