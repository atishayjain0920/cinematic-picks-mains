import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";
import { cn } from "@/lib/utils";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  isLoading?: boolean;
  onMovieClick?: (movie: Movie) => void;
}

const MovieRow = ({ title, movies, isLoading, onMovieClick }: MovieRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.8;
    rowRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold font-display text-foreground mb-4 px-4 md:px-8">
          {title}
        </h2>
        <div className="flex gap-3 px-4 md:px-8 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-40 h-60 md:w-48 md:h-72 flex-shrink-0 skeleton rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!movies?.length) return null;

  return (
    <div className="mb-8 group/row relative">
      <h2 className="text-xl md:text-2xl font-bold font-display text-foreground mb-4 px-4 md:px-8">
        {title}
      </h2>
      
      {/* Left scroll button */}
      <button
        onClick={() => scroll("left")}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full bg-gradient-to-r from-background to-transparent flex items-center justify-start pl-2 transition-opacity duration-300",
          showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </div>
      </button>

      {/* Movie cards */}
      <div
        ref={rowRef}
        onScroll={handleScroll}
        className="flex gap-3 px-4 md:px-8 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={onMovieClick}
          />
        ))}
      </div>

      {/* Right scroll button */}
      <button
        onClick={() => scroll("right")}
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full bg-gradient-to-l from-background to-transparent flex items-center justify-end pr-2 transition-opacity duration-300",
          showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full transition-colors">
          <ChevronRight className="w-5 h-5 text-foreground" />
        </div>
      </button>
    </div>
  );
};

export default MovieRow;
