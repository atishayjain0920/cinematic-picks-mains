import { useState } from "react";
import Navbar from "@/components/Navbar";
import MovieRow from "@/components/MovieRow";
import MovieModal from "@/components/MovieModal";
import { useUserHistory } from "@/hooks/useTMDB";
import { Movie } from "@/lib/tmdb";
import { UserMediaItem } from "@/lib/api";

const mapUserItemsToMovies = (items: UserMediaItem[] = []): Movie[] =>
  items.map((item) => ({
    id: item.tmdbId,
    title: item.title,
    name: item.title,
    overview: "From your watch history",
    poster_path: item.posterPath || null,
    backdrop_path: item.posterPath || null,
    vote_average: 0,
    genre_ids: [],
    media_type: item.mediaType,
    popularity: 0,
  }));

const History = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const token = localStorage.getItem("movieflix_token");
  const { data, isLoading } = useUserHistory(!!token);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMovieSelect={setSelectedMovie} />

      <div className="pt-24 px-6">
        <h1 className="text-2xl font-bold mb-6">🎬 Watch History</h1>

        {!token ? (
          <p>Please login to view your watch history</p>
        ) : (
          <MovieRow
            title="Recently Watched"
            movies={mapUserItemsToMovies(data || [])}
            isLoading={isLoading}
            onMovieClick={setSelectedMovie}
          />
        )}
      </div>

      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onMovieSelect={setSelectedMovie}
      />
    </div>
  );
};

export default History;