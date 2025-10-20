"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";

type TeamMode = "solo" | "multi";
type OnboardingStep = "mode" | "slug";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("mode");
  const [teamMode, setTeamMode] = useState<TeamMode | null>(null);
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Validate slug format
  const validateSlugFormat = (value: string): boolean => {
    const slugRegex = /^[a-z0-9-]{3,30}$/;
    return slugRegex.test(value);
  };

  // Check slug availability
  const checkSlugAvailability = async (value: string) => {
    if (!validateSlugFormat(value)) {
      setSlugError("3-30 characters, lowercase letters, numbers, and hyphens only");
      return false;
    }

    setIsCheckingSlug(true);
    setSlugError("");

    try {
      const response = await fetch("/api/slug/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: value }),
      });

      const data = await response.json();

      if (!data.available) {
        setSlugError(data.error || "This URL is already taken");
        setIsCheckingSlug(false);
        return false;
      }

      setIsCheckingSlug(false);
      return true;
    } catch (error) {
      setSlugError("Failed to check availability");
      setIsCheckingSlug(false);
      return false;
    }
  };

  // Handle slug input with debounce
  const handleSlugChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(cleaned);
    
    if (cleaned.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkSlugAvailability(cleaned);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSlugError("");
    }
  };

  // Create team
  const handleCreateTeam = async () => {
    if (!teamMode || !slug) return;

    const isValid = await checkSlugAvailability(slug);
    if (!isValid) return;

    setIsCreating(true);

    try {
      const response = await fetch("/api/onboarding/create-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          teamMode,
          name: session?.user?.name || "My Team",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSlugError(data.error || "Failed to create team");
        setIsCreating(false);
        return;
      }

      // Update session with team data
      await update();

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      setSlugError("Something went wrong. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className={`flex items-center gap-2 transition-all duration-300 ${
              currentStep === "mode" ? "opacity-100" : "opacity-40"
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                teamMode ? "bg-emerald-500 text-white" : "bg-white border-2 border-slate-300 text-slate-600"
              }`}>
                {teamMode ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <span className="text-sm font-medium text-slate-600">Choose Mode</span>
            </div>
            
            <div className="w-16 h-0.5 bg-slate-200 mx-2" />
            
            <div className={`flex items-center gap-2 transition-all duration-300 ${
              currentStep === "slug" ? "opacity-100" : "opacity-40"
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                currentStep === "slug" ? "bg-blue-600 text-white" : "bg-white border-2 border-slate-300 text-slate-600"
              }`}>
                2
              </div>
              <span className="text-sm font-medium text-slate-600">Claim URL</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-xl border-0 overflow-hidden">
          {currentStep === "mode" && (
            <div className="animate-in fade-in duration-500">
              <CardHeader className="text-center pb-8 pt-12 px-8">
                <CardTitle className="text-3xl font-bold mb-3">Welcome to Listing.Show</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Let's get you set up. How do you work?
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-12">
                <div className="grid gap-4">
                  <button
                    onClick={() => {
                      setTeamMode("solo");
                      setTimeout(() => setCurrentStep("slug"), 300);
                    }}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                      teamMode === "solo"
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all duration-200 ${
                        teamMode === "solo" ? "bg-blue-600" : "bg-slate-100 group-hover:bg-slate-200"
                      }`}>
                        👤
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">I'm an independent agent</h3>
                        <p className="text-sm text-slate-600">
                          Perfect for solo agents managing their own listings
                        </p>
                      </div>
                      {teamMode === "solo" && (
                        <Check className="w-6 h-6 text-blue-600 animate-in zoom-in duration-200" />
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setTeamMode("multi");
                      setTimeout(() => setCurrentStep("slug"), 300);
                    }}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                      teamMode === "multi"
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all duration-200 ${
                        teamMode === "multi" ? "bg-blue-600" : "bg-slate-100 group-hover:bg-slate-200"
                      }`}>
                        👥
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">We're a team / agency</h3>
                        <p className="text-sm text-slate-600">
                          For teams with multiple agents collaborating on properties
                        </p>
                      </div>
                      {teamMode === "multi" && (
                        <Check className="w-6 h-6 text-blue-600 animate-in zoom-in duration-200" />
                      )}
                    </div>
                  </button>
                </div>
              </CardContent>
            </div>
          )}

          {currentStep === "slug" && (
            <div className="animate-in fade-in duration-500">
              <CardHeader className="text-center pb-8 pt-12 px-8">
                <CardTitle className="text-3xl font-bold mb-3">Claim Your URL</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  This will be your public showcase page
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-12 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="slug" className="text-base font-medium">
                    Your Listing.Show URL
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-medium">listing.show/u/</span>
                    </div>
                    <Input
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="your-name"
                      className="pl-40 pr-12 h-14 text-lg font-medium"
                      disabled={isCreating}
                    />
                    {isCheckingSlug && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                      </div>
                    )}
                    {!isCheckingSlug && slug.length >= 3 && !slugError && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <Check className="w-5 h-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {slugError && (
                    <p className="text-sm text-red-600 animate-in fade-in duration-200">
                      {slugError}
                    </p>
                  )}
                  {!slugError && slug.length >= 3 && !isCheckingSlug && (
                    <p className="text-sm text-emerald-600 animate-in fade-in duration-200">
                      ✓ This URL is available
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    3-30 characters • Lowercase letters, numbers, and hyphens only
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("mode")}
                    disabled={isCreating}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateTeam}
                    disabled={!slug || slug.length < 3 || !!slugError || isCheckingSlug || isCreating}
                    className="flex-1 h-12 text-base font-medium"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Continue to Dashboard"
                    )}
                  </Button>
                </div>
              </CardContent>
            </div>
          )}
        </Card>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            🔒 Your 14-day free trial starts now • No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
