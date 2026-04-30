import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme: "outline" | "filled_blue" | "filled_black";
              size: "large" | "medium" | "small";
              text: "signin_with" | "signup_with" | "continue_with";
              shape: "rectangular" | "pill" | "circle" | "square";
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface GoogleAuthButtonProps {
  text: "signin_with" | "signup_with";
  isLoading?: boolean;
  onCredential: (credential: string) => Promise<void> | void;
}

function loadGoogleScript() {
  const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
  if (existingScript) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Google sign-in"));
    document.head.appendChild(script);
  });
}

export default function GoogleAuthButton({ text, isLoading, onCredential }: GoogleAuthButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function setupGoogleButton() {
      if (!GOOGLE_CLIENT_ID) return;

      try {
        await loadGoogleScript();
        if (!mounted || !buttonRef.current || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (!response.credential) {
              toast.error("Google did not return a credential");
              return;
            }

            await onCredential(response.credential);
          },
        });

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          width: buttonRef.current.offsetWidth || 320,
        });
        setIsReady(true);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load Google sign-in");
      }
    }

    setupGoogleButton();

    return () => {
      mounted = false;
    };
  }, [onCredential, text]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <Button type="button" variant="outline" disabled className="w-full h-12 bg-white/5 border-white/10">
        Add Google Client ID
      </Button>
    );
  }

  return (
    <div className="relative min-h-11 w-full overflow-hidden rounded-md">
      <div ref={buttonRef} className={isLoading ? "pointer-events-none opacity-60" : ""} />
      {!isReady && (
        <Button type="button" variant="outline" disabled className="absolute inset-0 w-full h-11 bg-white/5 border-white/10">
          Loading Google...
        </Button>
      )}
    </div>
  );
}
