"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/AuthProvider";

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;

  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      width?: number;
      logo_alignment?: "left" | "center";
    },
  ) => void;

  cancel: () => void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

interface GoogleLoginButtonProps {
  role?: "driver" | "parkingOwner";
}

let googleScriptPromise: Promise<void> | null = null;

let googleInitialized = false;

let googleCredentialHandler: ((credential: string) => Promise<void>) | null =
  null;

function loadGoogleScript(): Promise<void> {
  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), {
        once: true,
      });

      existingScript.addEventListener(
        "error",
        () => {
          reject(new Error("Failed to load Google Identity Services."));
        },
        { once: true },
      );

      return;
    }

    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();

    script.onerror = () => {
      reject(new Error("Failed to load Google Identity Services."));
    };

    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export default function GoogleLoginButton({ role }: GoogleLoginButtonProps) {
  const router = useRouter();
  const { googleLogin } = useAuth();

  const buttonRef = useRef<HTMLDivElement | null>(null);

  const handlerRef = useRef<(credential: string) => Promise<void>>(
    async () => {},
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    handlerRef.current = async (credential: string) => {
      try {
        setError("");
        setLoading(true);

        console.log("Google credential received: YES");

        const user = await googleLogin(credential);

        if (user.role === "driver") {
          router.replace("/");
          return;
        }

        if (user.role === "parkingOwner") {
          router.replace("/owner");
          return;
        }

        if (user.role === "admin") {
          router.replace("/admin");
          return;
        }

        setError("Unknown user role.");
      } catch (error: unknown) {
        console.error("Google login error:", error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Google login failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
  }, [googleLogin, router, role]);

  useEffect(() => {
    let cancelled = false;

    const initializeGoogle = async () => {
      try {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        if (!clientId) {
          setError("Google login is not configured.");
          return;
        }

        await loadGoogleScript();

        if (cancelled) {
          return;
        }

        if (!window.google?.accounts?.id) {
          throw new Error("Google Identity Services failed to initialize.");
        }

        if (!buttonRef.current) {
          return;
        }

        if (!googleInitialized) {
          googleInitialized = true;

          window.google.accounts.id.initialize({
            client_id: clientId,

            callback: async (response: GoogleCredentialResponse) => {
              if (!response?.credential) {
                console.error("Google credential was not returned.", response);

                if (googleCredentialHandler) {
                  await googleCredentialHandler("");
                }

                return;
              }

              if (googleCredentialHandler) {
                await googleCredentialHandler(response.credential);
              }
            },
          });
        }

        buttonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: buttonRef.current.clientWidth || 400,
          logo_alignment: "left",
        });
      } catch (error) {
        console.error("Google initialization error:", error);

        if (!cancelled) {
          setError("Unable to initialize Google login.");
        }
      }
    };

    googleCredentialHandler = async (credential: string) => {
      if (!credential) {
        setError("Google did not return a login credential.");
        return;
      }

      await handlerRef.current(credential);
    };

    initializeGoogle();

    return () => {
      cancelled = true;

      if (googleCredentialHandler) {
        googleCredentialHandler = null;
      }

      window.google?.accounts?.id.cancel();

      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div
        ref={buttonRef}
        className="flex min-h-[44px] w-full items-center justify-center"
      />

      {loading && (
        <div className="mt-2 text-center text-xs text-zinc-500">
          Signing in with Google...
        </div>
      )}

      {error && (
        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
