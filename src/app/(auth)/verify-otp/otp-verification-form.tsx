"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const OTP_LENGTH = 6;

export function OTPVerificationForm() {
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const setRef = (element: HTMLInputElement | null, index: number) => {
    inputRefs.current[index] = element;
  };

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveInput(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    
    pastedData.split("").forEach((value, index) => {
      newOtp[index] = value;
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = value;
      }
    });
    
    setOtp(newOtp);
    if (inputRefs.current[pastedData.length - 1]) {
      inputRefs.current[pastedData.length - 1]?.focus();
      setActiveInput(pastedData.length - 1);
    }
  };

  const onSubmit = async (otp: string) => {
    if (!userId) {
      toast("Invalid verification link", {
        description: "Please try signing up again",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      toast("Account verified!", {
        description: "You can now sign in to your account",
        action: {
          label: "Sign In",
          onClick: () => router.push("/login"),
        },
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error) {
      console.error("Verification error:", error);
      toast("Verification failed", {
        description: "Please try again or request a new code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-[440px] mx-auto">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={() => onSubmit(otp.join(""))} className="space-y-6">
            <div className="flex justify-center px-6">
              {otp.map((_, index) => (
                <input
                  key={index}
                  ref={(el) => setRef(el, index)}
                  type="text"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className={`w-11 h-12 text-center text-2xl font-bold border rounded-lg
                    focus:border-primary focus:ring-2 focus:ring-primary/20 
                    transition-all duration-200
                    mx-1 first:ml-0 last:mr-0
                    ${activeInput === index ? "border-primary" : "border-input"}
                    ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  disabled={isLoading}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.some((digit) => !digit)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Didn&apos;t receive the code?{" "}
            <button
              onClick={() => {/* Add resend logic */}}
              className="text-primary hover:underline disabled:opacity-50"
              disabled={isLoading}
            >
              Resend
            </button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 