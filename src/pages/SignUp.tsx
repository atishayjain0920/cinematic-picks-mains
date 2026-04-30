import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { signInWithGoogle, signUp } from "@/lib/api";

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const saveSession = useCallback((token: string, user: { name: string; email: string }) => {
    localStorage.setItem("movieflix_token", token);
    localStorage.setItem("movieflix_user", user.name);
    localStorage.setItem("movieflix_email", user.email);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    
    try {
      const { token, user } = await signUp(name, email, password);
      saveSession(token, user);
      toast.success("Account created successfully!");
      navigate("/home");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign up");
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
        toast.success("Account created successfully!");
        navigate("/home");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to sign up with Google");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, saveSession]
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center py-10">
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

      {/* Sign Up Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display text-foreground mb-2">
              Create Account
            </h1>
            <p className="text-muted-foreground">
              Join MovieFlix for unlimited streaming
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-11 h-12 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
              />
            </div>

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

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-11 pr-11 h-12 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                "Create Account"
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            By signing up, you agree to our{" "}
            <button className="text-primary hover:underline">Terms of Service</button>{" "}
            and{" "}
            <button className="text-primary hover:underline">Privacy Policy</button>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <GoogleAuthButton
            text="signup_with"
            isLoading={isLoading}
            onCredential={handleGoogleCredential}
          />

          {/* Sign in link */}
          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
