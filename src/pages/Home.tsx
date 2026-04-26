import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import MovieRow from "@/components/MovieRow";
import MovieModal from "@/components/MovieModal";
import { useTrending, usePopular, useTopRated, useNowPlaying, useMoviesByGenre, useUserFavorites, useUserHistory } from "@/hooks/useTMDB";
import { Movie } from "@/lib/tmdb";
import { UserMediaItem } from "@/lib/api";

type FilterType = "all" | "movies" | "tv" | "trending" | "favorites" | "history";

const mapUserItemsToMovies = (items: UserMediaItem[] = []): Movie[] =>
  items.map((item) => ({
    id: item.tmdbId,
    title: item.title,
    name: item.title,
    overview: "Saved from your account list.",
    poster_path: item.posterPath || null,
    backdrop_path: item.posterPath || null,
    vote_average: 0,
    genre_ids: [],
    media_type: item.mediaType,
    popularity: 0,
  }));

const Home = () => {
  const [searchParams] = useSearchParams();
  const filter = (searchParams.get("filter") as FilterType) || "all";
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Fetch all data
  const { data: trending, isLoading: trendingLoading } = useTrending("all", "week");
  const { data: trendingMovies, isLoading: trendingMoviesLoading } = useTrending("movie", "week");
  const { data: trendingTV, isLoading: trendingTVLoading } = useTrending("tv", "week");
  const { data: popularMovies, isLoading: popularMoviesLoading } = usePopular("movie");
  const { data: topRatedMovies, isLoading: topRatedMoviesLoading } = useTopRated("movie");
  const { data: nowPlaying, isLoading: nowPlayingLoading } = useNowPlaying();
  const { data: popularTV, isLoading: popularTVLoading } = usePopular("tv");
  const { data: topRatedTV, isLoading: topRatedTVLoading } = useTopRated("tv");
  const token = localStorage.getItem("movieflix_token");
  const shouldLoadFavorites = filter === "favorites" && !!token;
  const shouldLoadHistory = filter === "history" && !!token;
  const { data: userFavorites, isLoading: favoritesLoading } = useUserFavorites(shouldLoadFavorites);
  const { data: userHistory, isLoading: historyLoading } = useUserHistory(shouldLoadHistory);
  
  // Genre data for movies
  const { data: action } = useMoviesByGenre(28);
  const { data: comedy } = useMoviesByGenre(35);
  const { data: thriller } = useMoviesByGenre(53);
  const { data: scifi } = useMoviesByGenre(878);
  const { data: horror } = useMoviesByGenre(27);
  const { data: romance } = useMoviesByGenre(10749);

  // TV Genre data
  const { data: actionTV } = useMoviesByGenre(10759, "tv"); // Action & Adventure
  const { data: dramaTV } = useMoviesByGenre(18, "tv");
  const { data: comedyTV } = useMoviesByGenre(35, "tv");
  const { data: crimeTV } = useMoviesByGenre(80, "tv");

  // Get hero slider content based on filter
  const heroContent = useMemo(() => {
    switch (filter) {
      case "movies":
        return trendingMovies || [];
      case "tv":
        return trendingTV || [];
      case "trending":
        return trending || [];
      case "favorites":
        return mapUserItemsToMovies(userFavorites);
      case "history":
        return mapUserItemsToMovies(userHistory);
      default:
        return trending || [];
    }
  }, [filter, trending, trendingMovies, trendingTV, userFavorites, userHistory]);

  // Render content based on filter
  const renderContent = () => {
    switch (filter) {
      case "movies":
        return (
          <>
            <MovieRow title="Trending Movies" movies={trendingMovies || []} isLoading={trendingMoviesLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Popular Movies" movies={popularMovies || []} isLoading={popularMoviesLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Now Playing" movies={nowPlaying || []} isLoading={nowPlayingLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Top Rated Movies" movies={topRatedMovies || []} isLoading={topRatedMoviesLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Action" movies={action || []} onMovieClick={setSelectedMovie} />
            <MovieRow title="Comedy" movies={comedy || []} onMovieClick={setSelectedMovie} />
            <MovieRow title="Thriller" movies={thriller || []} onMovieClick={setSelectedMovie} />
            <MovieRow title="Sci-Fi" movies={scifi || []} onMovieClick={setSelectedMovie} />
            <MovieRow title="Horror" movies={horror || []} onMovieClick={setSelectedMovie} />
            <MovieRow title="Romance" movies={romance || []} onMovieClick={setSelectedMovie} />
          </>
        );
      
      case "tv":
        return (
          <>
            <MovieRow title="Trending TV Shows" movies={trendingTV || []} isLoading={trendingTVLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Popular TV Shows" movies={popularTV || []} isLoading={popularTVLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Top Rated TV Shows" movies={topRatedTV || []} isLoading={topRatedTVLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Action & Adventure" movies={actionTV || []} onMovieClick={setSelectedMovie} />
            <MovieRow title="Drama" movies={dramaTV || []} onMovieClick={setSelectedMovie} />
            <MovieRow title="Comedy" movies={comedyTV || []} onMovieClick={setSelectedMovie} />
            <MovieRow title="Crime" movies={crimeTV || []} onMovieClick={setSelectedMovie} />
          </>
        );
      
      case "trending":
        return (
          <>
            <MovieRow title="Trending This Week" movies={trending || []} isLoading={trendingLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Trending Movies" movies={trendingMovies || []} isLoading={trendingMoviesLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Trending TV Shows" movies={trendingTV || []} isLoading={trendingTVLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Popular Right Now" movies={popularMovies || []} isLoading={popularMoviesLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Hot TV Series" movies={popularTV || []} isLoading={popularTVLoading} onMovieClick={setSelectedMovie} />
          </>
        );

      case "favorites":
        return (
          <MovieRow
            title="My Favorites"
            movies={mapUserItemsToMovies(userFavorites)}
            isLoading={favoritesLoading}
            onMovieClick={setSelectedMovie}
          />
        );

      case "history":
        return (
          <MovieRow
            title="Watch History"
            movies={mapUserItemsToMovies(userHistory)}
            isLoading={historyLoading}
            onMovieClick={setSelectedMovie}
          />
        );
      
      default: // "all"
        return (
          <>
            <MovieRow title="Trending Now" movies={trending || []} isLoading={trendingLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Popular Movies" movies={popularMovies || []} isLoading={popularMoviesLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Now Playing" movies={nowPlaying || []} isLoading={nowPlayingLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Top Rated" movies={topRatedMovies || []} isLoading={topRatedMoviesLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Popular TV Shows" movies={popularTV || []} isLoading={popularTVLoading} onMovieClick={setSelectedMovie} />
            <MovieRow title="Action" movies={action || []} onMovieClick={setSelectedMovie} />
            <MovieRow title="Comedy" movies={comedy || []} onMovieClick={setSelectedMovie} />
            <MovieRow title="Thriller" movies={thriller || []} onMovieClick={setSelectedMovie} />
            <MovieRow title="Sci-Fi" movies={scifi || []} onMovieClick={setSelectedMovie} />
            <MovieRow title="Horror" movies={horror || []} onMovieClick={setSelectedMovie} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMovieSelect={setSelectedMovie} />

      {/* Hero Slider */}
      <HeroSlider movies={heroContent} onMovieClick={setSelectedMovie} />

      {/* Content rows with fade animation */}
      <div className="relative z-10 -mt-20 pb-16 animate-fade-in" key={filter}>
        {renderContent()}
      </div>

      {/* Movie modal */}
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} onMovieSelect={setSelectedMovie} />
    </div>
  );
};

export default Home;
