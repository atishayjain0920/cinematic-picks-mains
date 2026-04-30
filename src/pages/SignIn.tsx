import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { signIn, signInWithGoogle } from "@/lib/api";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const saveSession = useCallback((token: string, user: { name: string; email: string }) => {
    localStorage.setItem("movieflix_token", token);
    localStorage.setItem("movieflix_user", user.name);
    localStorage.setItem("movieflix_email", user.email);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const { token, user } = await signIn(email, password);
      saveSession(token, user);
      toast.success("Welcome back!");
      navigate("/home");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setIsLoading(true);

      try {
        const { token, user } = await signInWithGoogle(credential);
        saveSession(token, user);
        toast.success("Welcome back!");
        navigate("/home");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to sign in with Google");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, saveSession]
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <AnimatedBackground />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-0" />

      {/* Logo */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 z-20"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-lg flex items-center justify-center">
          <Film className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold font-display gradient-text">
          MovieFlix
        </span>
      </Link>

      {/* Sign In Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to continue watching
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 h-12 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-11 h-12 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-primary-foreground font-semibold text-base"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <GoogleAuthButton
            text="signin_with"
            isLoading={isLoading}
            onCredential={handleGoogleCredential}
          />

          {/* Sign up link */}
          <p className="text-center text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
