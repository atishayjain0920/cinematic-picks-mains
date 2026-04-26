import { useState, useEffect } from "react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface MovieCarouselProps {
  movies: Movie[];
  onMovieClick?: (movie: Movie) => void;
}

const MovieCarousel = ({ movies, onMovieClick }: MovieCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayMovies = movies.slice(0, 8);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayMovies.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [displayMovies.length]);

  if (!displayMovies.length) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-32 h-48 skeleton rounded-lg flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main carousel */}
      <div className="flex gap-4 overflow-hidden">
        {displayMovies.map((movie, index) => {
          // Calculate position relative to current
          const position = (index - currentIndex + displayMovies.length) % displayMovies.length;
          const isActive = position === 0;
          const isVisible = position < 4;

          if (!isVisible) return null;

          return (
            <div
              key={movie.id}
              onClick={() => onMovieClick?.(movie)}
              className={cn(
                "relative flex-shrink-0 cursor-pointer transition-all duration-500 ease-out",
                isActive ? "w-40 h-60 z-10 scale-105" : "w-32 h-48 opacity-60 hover:opacity-80"
              )}
              style={{
                transform: `translateX(${position * 10}px)`,
              }}
            >
              <img
                src={getImageUrl(movie.poster_path, "w300")}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover rounded-lg shadow-2xl"
              />
              
              {isActive && (
                <div className="absolute inset-0 rounded-lg ring-2 ring-primary/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]" />
              )}

              {/* Rating badge on active */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent rounded-b-lg">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-foreground">
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {movie.title || movie.name}
                  </h4>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-1.5 mt-6">
        {displayMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              index === currentIndex
                ? "w-6 bg-primary"
                : "w-1.5 bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default MovieCarousel;
