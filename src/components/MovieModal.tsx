import { X, Play, Star, Clock, Calendar, ExternalLink, Heart } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { useMovieDetails, useRecommendations } from "@/hooks/useTMDB";
import { Button } from "@/components/ui/button";
import MovieCard from "./MovieCard";
import { useEffect, useState } from "react";
import { addFavorite, addHistory, getFavorites, removeFavorite } from "@/lib/api";
import { toast } from "sonner";

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  onMovieSelect?: (movie: Movie) => void;
}

const MovieModal = ({ movie, onClose, onMovieSelect }: MovieModalProps) => {
  const mediaType = movie?.media_type || "movie";
  const { data: details } = useMovieDetails(movie?.id || null, mediaType);
  const { data: recommendations } = useRecommendations(movie?.id || null, mediaType);
  const [isFavorite, setIsFavorite] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (movie) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [movie]);

  useEffect(() => {
    if (!movie) return;

    const token = localStorage.getItem("movieflix_token");
    if (!token) return;

    const title = movie.title || movie.name || "Untitled";

    addHistory({
      tmdbId: movie.id,
      mediaType,
      title,
      posterPath: movie.poster_path,
    }).catch(() => {
      // non-blocking
    });

    getFavorites()
      .then((items) => {
        setIsFavorite(items.some((item) => item.tmdbId === movie.id && item.mediaType === mediaType));
      })
      .catch(() => {
        // ignore
      });
  }, [movie, mediaType]);

  if (!movie) return null;

  const title = details?.title || details?.name || movie.title || movie.name || "Untitled";
  const year = (details?.release_date || details?.first_air_date || movie.release_date || movie.first_air_date)?.split("-")[0];
  const runtime = details?.runtime || details?.episode_run_time?.[0];
  const rating = (details?.vote_average || movie.vote_average)?.toFixed(1);
  const genres = details?.genres || [];
  const trailer = details?.videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube");

  const onToggleFavorite = async () => {
    const token = localStorage.getItem("movieflix_token");
    if (!token) {
      toast.error("Please sign in to manage favorites");
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite(movie.id, mediaType);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await addFavorite({
          tmdbId: movie.id,
          mediaType,
          title,
          posterPath: movie.poster_path,
        });
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update favorites");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8 overflow-y-auto"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

      {/* Modal content */}
      <div
        className="relative w-full max-w-4xl my-8 bg-card rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        {/* Hero image */}
        <div className="relative h-64 md:h-96">
          <img
            src={getImageUrl(movie.backdrop_path || movie.poster_path, "original")}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-card/80 to-transparent" />

          {/* Poster (desktop) */}
          <div className="hidden md:block absolute -bottom-16 left-8 w-40 h-60 rounded-xl overflow-hidden shadow-2xl border-4 border-card">
            <img
              src={getImageUrl(movie.poster_path, "w500")}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:pl-56 md:pr-8 md:pt-6">
          {/* Title */}
          <h2 className="text-2xl md:text-4xl font-bold font-display text-foreground mb-3">
            {title}
          </h2>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-foreground">{rating}</span>
            </div>
            {year && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{year}</span>
              </div>
            )}
            {runtime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{runtime} min</span>
              </div>
            )}
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-sm uppercase font-medium">
              {mediaType === "tv" ? "TV Series" : "Movie"}
            </span>
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {genres.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-white/10 text-foreground px-3 py-1 rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Tagline */}
          {details?.tagline && (
            <p className="text-lg italic text-muted-foreground mb-4">
              "{details.tagline}"
            </p>
          )}

          {/* Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Overview</h3>
            <p className="text-muted-foreground leading-relaxed">
              {details?.overview || movie.overview || "No overview available."}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            {trailer && (
              <Button
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90 glow-effect"
                asChild
              >
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Trailer
                </a>
              </Button>
            )}

            <Button
              size="lg"
              variant={isFavorite ? "default" : "outline"}
              className="gap-2"
              onClick={onToggleFavorite}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "Favorited" : "Add Favorite"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="gap-2 bg-white/10 hover:bg-white/20 border-white/20"
              asChild
            >
              <a
                href={`https://www.themoviedb.org/${mediaType}/${movie.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-5 h-5" />
                View on TMDB
              </a>
            </Button>
          </div>

          {/* Cast */}
          {details?.credits?.cast && details.credits.cast.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-3">Cast</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {details.credits.cast.slice(0, 10).map((actor) => (
                  <div key={actor.id} className="flex-shrink-0 text-center w-20">
                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-muted mb-2">
                      <img
                        src={getImageUrl(actor.profile_path, "w200")}
                        alt={actor.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">{actor.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar / Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">You May Also Like</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {recommendations.slice(0, 6).map((rec) => (
                  <MovieCard
                    key={rec.id}
                    movie={{ ...rec, media_type: mediaType }}
                    size="sm"
                    onClick={(m) => {
                      onMovieSelect?.(m);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
