import { useState, useEffect, useRef } from "react";
import { Search, X, Film, Tv, Loader2 } from "lucide-react";
import { useSearch } from "@/hooks/useTMDB";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onMovieSelect?: (movie: Movie) => void;
  variant?: "landing" | "home";
  className?: string;
}

const SearchBar = ({ onMovieSelect, variant = "home", className }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results, isLoading } = useSearch(debouncedQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (movie: Movie) => {
    onMovieSelect?.(movie);
    setQuery("");
    setIsFocused(false);
  };

  const showDropdown = isFocused && query.length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Search input */}
      <div
        className={cn(
          "relative flex items-center transition-all duration-300",
          variant === "landing"
            ? "glass-card p-2"
            : "bg-white/5 rounded-xl border border-white/10"
        )}
      >
        <Search
          className={cn(
            "absolute left-4 text-muted-foreground transition-colors",
            variant === "landing" ? "w-6 h-6" : "w-5 h-5"
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search movies or web series..."
          className={cn(
            "w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none",
            variant === "landing"
              ? "pl-14 pr-12 py-4 text-lg"
              : "pl-12 pr-10 py-3 text-base"
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-12 w-5 h-5 text-muted-foreground animate-spin" />
        )}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search results dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card max-h-96 overflow-y-auto z-50 animate-scale-in">
          {results && results.length > 0 ? (
            <div className="p-2">
              {results.slice(0, 8).map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleSelect(movie)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left group"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                    <img
                      src={getImageUrl(movie.poster_path, "w200")}
                      alt={movie.title || movie.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {movie.media_type === "tv" ? (
                        <Tv className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : (
                        <Film className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                      <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {movie.title || movie.name}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(movie.release_date || movie.first_air_date)?.split("-")[0] || "N/A"}
                      {movie.vote_average > 0 && (
                        <span className="ml-2">⭐ {movie.vote_average.toFixed(1)}</span>
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : debouncedQuery && !isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Film className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No results found for "{debouncedQuery}"</p>
              <p className="text-sm mt-1">Try searching for another movie or series</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
