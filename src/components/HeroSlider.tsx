import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Info, Star } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroSliderProps {
  movies: Movie[];
  onMovieClick?: (movie: Movie) => void;
}

const HeroSlider = ({ movies, onMovieClick }: HeroSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const displayMovies = movies.slice(0, 5);

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [currentIndex, displayMovies.length]);

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % displayMovies.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + displayMovies.length) % displayMovies.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  if (!displayMovies.length) {
    return (
      <div className="relative h-[70vh] md:h-[80vh] bg-gradient-to-b from-muted to-background animate-pulse" />
    );
  }

  const currentMovie = displayMovies[currentIndex];
  const title = currentMovie.title || currentMovie.name || "Untitled";
  const year = (currentMovie.release_date || currentMovie.first_air_date)?.split("-")[0];

  return (
    <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background images */}
      {displayMovies.map((movie, index) => (
        <div
          key={movie.id}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-in-out",
            index === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
        >
          <img
            src={getImageUrl(movie.backdrop_path, "original")}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div
            key={currentIndex}
            className="max-w-2xl animate-slide-up"
          >
            {/* Media type badge */}
            {currentMovie.media_type && (
              <span className="inline-block bg-primary/90 text-primary-foreground px-3 py-1 rounded-md text-sm font-medium mb-4 uppercase">
                {currentMovie.media_type === "tv" ? "TV Series" : "Movie"}
              </span>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-foreground text-shadow mb-4">
              {title}
            </h1>

            {/* Meta info */}
            <div className="flex items-center gap-4 mb-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-foreground">
                  {currentMovie.vote_average.toFixed(1)}
                </span>
              </div>
              {year && <span>{year}</span>}
            </div>

            {/* Overview */}
            <p className="text-base md:text-lg text-muted-foreground line-clamp-3 mb-6 max-w-xl">
              {currentMovie.overview}
            </p>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 glow-effect"
                onClick={() => onMovieClick?.(currentMovie)}
              >
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-white/10 hover:bg-white/20 border-white/20 text-foreground font-semibold px-8"
                onClick={() => onMovieClick?.(currentMovie)}
              >
                <Info className="w-5 h-5" />
                More Info
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm p-3 rounded-full transition-all duration-300 opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-foreground" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm p-3 rounded-full transition-all duration-300 opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-foreground" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {displayMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentIndex(index);
                setTimeout(() => setIsTransitioning(false), 500);
              }
            }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === currentIndex
                ? "w-8 bg-primary"
                : "w-1.5 bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
