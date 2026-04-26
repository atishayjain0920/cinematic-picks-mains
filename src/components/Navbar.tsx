import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Film, Home, Tv, Flame, Search } from "lucide-react";
import SearchBar from "./SearchBar";
import ProfileDropdown from "./ProfileDropdown";
import { Movie } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onMovieSelect?: (movie: Movie) => void;
}

const Navbar = ({ onMovieSelect }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("movieflix_token");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔥 History click handler
  const handleHistoryClick = () => {
    if (!token) {
      alert("Login required to view watch history");
      return;
    }
    navigate("/history");
  };

  const navLinks = [
    { path: "/home", filter: "", label: "Home", icon: Home },
    { path: "/home?filter=movies", filter: "movies", label: "Movies", icon: Film },
    { path: "/home?filter=tv", filter: "tv", label: "TV Shows", icon: Tv },
    { path: "/home?filter=trending", filter: "trending", label: "Trending", icon: Flame },
  ];

  const currentFilter =
    new URLSearchParams(location.search).get("filter") || "";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled
          ? "bg-background/90 backdrop-blur-lg border-b border-white/5 shadow-lg"
          : "bg-gradient-to-b from-background/80 to-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display gradient-text hidden sm:block">
              MovieFlix
            </span>
          </Link>

          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === "/home" &&
                currentFilter === link.filter;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <link.icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive && "text-primary"
                    )}
                  />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            
            {/* 🔥 Watch History Button */}
            <button
              onClick={handleHistoryClick}
              disabled={!token}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition",
                token
                  ? "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  : "text-muted-foreground opacity-50 cursor-not-allowed"
              )}
            >
              
            </button>

            {/* Search toggle (mobile) */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Search bar (desktop) */}
            <div className="hidden md:block w-64">
              <SearchBar onMovieSelect={onMovieSelect} />
            </div>

            {/* Profile */}
            <ProfileDropdown />
          </div>
        </div>

        {/* Mobile search */}
        {showSearch && (
          <div className="md:hidden pb-4 animate-slide-up">
            <SearchBar
              onMovieSelect={(movie) => {
                onMovieSelect?.(movie);
                setShowSearch(false);
              }}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;