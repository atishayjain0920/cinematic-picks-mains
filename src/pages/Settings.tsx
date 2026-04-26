import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getMe, updateSettings } from "@/lib/api";

const Settings = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [autoplayTrailers, setAutoplayTrailers] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("movieflix_token");
    if (!token) {
      toast.error("Please sign in first");
      navigate("/signin");
      return;
    }

    getMe()
      .then((user) => {
        setName(user.name);
        setLanguage(user.settings?.language || "en");
        setAutoplayTrailers(user.settings?.autoplayTrailers ?? true);
      })
      .catch(() => {
        toast.error("Failed to load settings");
      });
  }, [navigate]);

  const onSave = async () => {
    setIsSaving(true);
    try {
      const user = await updateSettings({ name, language, autoplayTrailers });
      localStorage.setItem("movieflix_user", user.name);
      toast.success("Settings updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 md:px-8 pt-28 pb-12">
        <div className="max-w-2xl glass-card p-6 md:p-8">
          <h1 className="text-3xl font-bold font-display mb-2">Account Settings</h1>
          <p className="text-muted-foreground mb-8">Manage your profile and playback preferences.</p>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Input id="language" value={language} onChange={(e) => setLanguage(e.target.value)} />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 p-4">
              <div>
                <p className="font-medium">Autoplay trailers</p>
                <p className="text-sm text-muted-foreground">Automatically play trailers in the details view.</p>
              </div>
              <Switch checked={autoplayTrailers} onCheckedChange={setAutoplayTrailers} />
            </div>

            <Button onClick={onSave} disabled={isSaving} className="w-full md:w-auto">
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
