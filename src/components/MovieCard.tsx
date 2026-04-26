import { Star, Play, Info } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const MovieCard = ({ movie, onClick, className, size = "md" }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date)?.split("-")[0] || "";
  const rating = movie.vote_average?.toFixed(1) || "N/A";

  const sizeClasses = {
    sm: "w-32 h-48",
    md: "w-40 h-60 md:w-48 md:h-72",
    lg: "w-48 h-72 md:w-56 md:h-84",
  };

  return (
    <div
      className={cn(
        "movie-card group flex-shrink-0",
        sizeClasses[size],
        className
      )}
      onClick={() => onClick?.(movie)}
    >
      {/* Skeleton loader */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 skeleton animate-pulse" />
      )}

      {/* Poster image */}
      <img
        src={imageError ? "/placeholder.svg" : getImageUrl(movie.poster_path, "w500")}
        alt={title}
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-foreground">{rating}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <button className="flex-1 flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg text-xs font-medium transition-colors">
            <Play className="w-3 h-3 fill-current" />
            Play
          </button>
          <button className="flex items-center justify-center bg-white/20 hover:bg-white/30 text-foreground p-2 rounded-lg transition-colors">
            <Info className="w-3 h-3" />
          </button>
        </div>

        {/* Title and year */}
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 text-shadow">
          {title}
        </h3>
        {year && (
          <span className="text-xs text-muted-foreground mt-1">{year}</span>
        )}
      </div>

      {/* Media type badge */}
      {movie.media_type && (
        <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium text-primary-foreground uppercase">
          {movie.media_type === "tv" ? "TV" : "Movie"}
        </div>
      )}
    </div>
  );
};

export default MovieCard;
