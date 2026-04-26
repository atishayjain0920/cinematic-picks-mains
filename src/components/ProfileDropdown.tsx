import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogIn, UserPlus, LogOut, History, Heart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMe } from "@/lib/api";
import { toast } from "sonner";

interface ProfileDropdownProps {
  className?: string;
}

const ProfileDropdown = ({ className }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("movieflix_token");

    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    getMe()
      .then((user) => {
        setIsLoggedIn(true);
        setUsername(user.name);
        localStorage.setItem("movieflix_user", user.name);
        localStorage.setItem("movieflix_email", user.email);
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("movieflix_token");
    localStorage.removeItem("movieflix_user");
    localStorage.removeItem("movieflix_email");
    setIsLoggedIn(false);
    setUsername("");
    setIsOpen(false);
    navigate("/");
  };

  // 🔥 FIXED NAVIGATION
  const openSection = (section: "history" | "favorites" | "settings") => {
    setIsOpen(false);

    if (section === "settings") {
      navigate("/settings");
      return;
    }

    if (section === "history") {
      navigate("/history"); // ✅ FIXED
      return;
    }

    if (section === "favorites") {
      navigate("/home?filter=favorites"); // ✅ FIXED
      return;
    }
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full transition-all duration-300"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-500 rounded-full flex items-center justify-center">
          {isLoggedIn ? (
            <span className="text-sm font-bold text-primary-foreground uppercase">
              {username.charAt(0)}
            </span>
          ) : (
            <User className="w-4 h-4 text-primary-foreground" />
          )}
        </div>

        {isLoggedIn && (
          <span className="hidden md:block text-sm font-medium text-foreground max-w-24 truncate">
            {username}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 glass-card p-2 z-50 animate-scale-in">
          
          {isLoggedIn ? (
            <>
              {/* User Info */}
              <div className="px-3 py-2 border-b border-white/10 mb-2">
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="font-medium text-foreground truncate">{username}</p>
              </div>

              {/* Watch History */}
              <button
                onClick={() => openSection("history")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
              >
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Watch History</span>
              </button>

              {/* Favorites */}
              <button
                onClick={() => openSection("favorites")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
              >
                <Heart className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">My Favorites</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => openSection("settings")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Settings</span>
              </button>

              {/* Logout */}
              <div className="border-t border-white/10 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/20 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
              >
                <LogIn className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Sign In</span>
              </Link>

              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
              >
                <UserPlus className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Create Account</span>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;