import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Film } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import SearchBar from "@/components/SearchBar";
import MovieCarousel from "@/components/MovieCarousel";
import MovieModal from "@/components/MovieModal";
import { Button } from "@/components/ui/button";
import { useTrending } from "@/hooks/useTMDB";
import { Movie } from "@/lib/tmdb";

const Landing = () => {
  const navigate = useNavigate();
  const { data: trending } = useTrending("all", "week");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 py-20">
        {/* Left section */}
        <div className="flex-1 max-w-xl text-center lg:text-left animate-slide-up">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center glow-effect">
              <Film className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold font-display gradient-text">MovieFlix</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground mb-6 leading-tight">
            Discover Your Next{" "}
            <span className="gradient-text">Favorite</span>{" "}
            Movie
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0">
            Explore thousands of movies and TV shows. Get personalized recommendations based on what you love.
          </p>

          {/* Search bar */}
          <div className="mb-6">
            <SearchBar variant="landing" onMovieSelect={setSelectedMovie} />
          </div>

          {/* Home button */}
          <Button
            size="lg"
            onClick={() => navigate("/home")}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 glow-effect"
          >
            Browse All
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Right section - Carousel */}
        <div className="flex-1 max-w-md hidden md:block animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">Trending Now</h3>
          <MovieCarousel movies={trending || []} onMovieClick={setSelectedMovie} />
        </div>
      </div>

      {/* Movie modal */}
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} onMovieSelect={setSelectedMovie} />
    </div>
  );
};

export default Landing;
