"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { signIn } from "next-auth/react";

export function SocialLoginButtons() {
  const [isLoading, setIsLoading] = useState({
    google: false,
    discord: false,
  });

  const handleLogin = async (provider: "google" | "discord") => {
    try {
      setIsLoading(prev => ({ ...prev, [provider]: true }));
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error(`${provider} login error:`, error);
    } finally {
      setIsLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
      <Button
        variant="outline"
        onClick={() => handleLogin("google")}
        disabled={isLoading.google || isLoading.discord}
        className="w-full gap-2"
      >
        {isLoading.google ? (
          <Icons.spinner className="h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="h-4 w-4" />
        )}
        Google
      </Button>
      <Button
        variant="outline"
        onClick={() => handleLogin("discord")}
        disabled={isLoading.google || isLoading.discord}
        className="w-full gap-2"
      >
        {isLoading.discord ? (
          <Icons.spinner className="h-4 w-4 animate-spin" />
        ) : (
          <Icons.discord className="h-4 w-4" />
        )}
        Discord
      </Button>
    </div>
  );
} 