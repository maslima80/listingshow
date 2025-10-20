"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2, Moon, Sun, Sparkles } from "lucide-react";
import { themePresets, processAccentColor, type ThemeMode } from "@/lib/theme";

interface ThemePickerProps {
  teamId: string;
  currentMode?: ThemeMode;
  currentAccent?: string;
  onSave?: () => void;
}

export function ThemePicker({ teamId, currentMode = "light", currentAccent = "#C9A66B", onSave }: ThemePickerProps) {
  const [mode, setMode] = useState<ThemeMode>(currentMode);
  const [accentColor, setAccentColor] = useState(currentAccent);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Generate CSS for preview only
  const previewStyle = (() => {
    const processed = processAccentColor(accentColor, mode);
    const baseTokens = mode === "dark" 
      ? {
          background: "240 10% 3.9%",
          foreground: "0 0% 98%",
          card: "240 10% 7%",
          cardForeground: "0 0% 98%",
          muted: "240 3.7% 15.9%",
          mutedForeground: "240 5% 64.9%",
          border: "240 3.7% 15.9%",
          input: "240 3.7% 15.9%",
        }
      : {
          background: "0 0% 100%",
          foreground: "240 10% 3.9%",
          card: "0 0% 100%",
          cardForeground: "240 10% 3.9%",
          muted: "240 4.8% 95.9%",
          mutedForeground: "240 3.8% 46.1%",
          border: "240 5.9% 90%",
          input: "240 5.9% 90%",
        };

    return {
      "--background": baseTokens.background,
      "--foreground": baseTokens.foreground,
      "--card": baseTokens.card,
      "--card-foreground": baseTokens.cardForeground,
      "--muted": baseTokens.muted,
      "--muted-foreground": baseTokens.mutedForeground,
      "--border": baseTokens.border,
      "--input": baseTokens.input,
      "--primary": processed.primary,
      "--primary-foreground": processed.primaryForeground,
      "--accent": processed.accent,
      "--accent-foreground": processed.accentForeground,
      "--ring": processed.ring,
    } as React.CSSProperties;
  })();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/theme/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          mode,
          accentColor,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        onSave?.();
      }
    } catch (error) {
      console.error("Failed to save theme:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const suggestedColors = [
    { name: "Teal", value: "#3f7b74" },      // Listing.Show brand teal
    { name: "Coral", value: "#c17b69" },     // Listing.Show brand coral
    { name: "Navy", value: "#162144" },      // Listing.Show brand navy
    { name: "Gold", value: "#C9A66B" },
    { name: "Emerald", value: "#059669" },
    { name: "Violet", value: "#7C3AED" },
  ];

  return (
    <div className="space-y-8">
      {/* Mode Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Choose Your Style</h3>
          <p className="text-sm text-muted-foreground">
            Select the base theme for your public pages (properties & hub)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Light Luxe */}
          <button
            onClick={() => setMode("light")}
            className={`group relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              mode === "light"
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border hover:border-primary/50 hover:shadow-md"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  mode === "light" ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-muted/80"
                }`}
              >
                <Sun className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base mb-1">Light Luxe</h4>
                <p className="text-sm text-muted-foreground">Clean, premium sophistication</p>
              </div>
              {mode === "light" && (
                <Check className="w-5 h-5 text-primary animate-in zoom-in duration-200" />
              )}
            </div>
          </button>

          {/* Dark Luxe */}
          <button
            onClick={() => setMode("dark")}
            className={`group relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              mode === "dark"
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border hover:border-primary/50 hover:shadow-md"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  mode === "dark" ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-muted/80"
                }`}
              >
                <Moon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base mb-1">Dark Luxe</h4>
                <p className="text-sm text-muted-foreground">Sophisticated dark elegance</p>
              </div>
              {mode === "dark" && (
                <Check className="w-5 h-5 text-primary animate-in zoom-in duration-200" />
              )}
            </div>
          </button>
        </div>
      </div>

      <Separator />

      {/* Accent Color */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Your Accent Color</h3>
          <p className="text-sm text-muted-foreground">
            This color will be used for buttons, links, and highlights
          </p>
        </div>

        <div className="space-y-4">
          {/* Color Input */}
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="accent-color">Custom Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accent-color"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-20 h-12 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={accentColor.toUpperCase()}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-F]{0,6}$/i.test(value)) {
                      setAccentColor(value);
                    }
                  }}
                  className="flex-1 font-mono"
                  placeholder="#C9A66B"
                />
              </div>
            </div>
          </div>

          {/* Suggested Colors */}
          <div className="space-y-2">
            <Label>Suggested Colors</Label>
            <div className="grid grid-cols-6 gap-2">
              {suggestedColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setAccentColor(color.value)}
                  className={`group relative aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    accentColor.toUpperCase() === color.value.toUpperCase()
                      ? "border-foreground shadow-lg"
                      : "border-border hover:border-foreground/50"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {accentColor.toUpperCase() === color.value.toUpperCase() && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Live Preview */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Preview Your Public Pages</h3>
          <span className="text-xs text-muted-foreground">(Dashboard stays light)</span>
        </div>

        {/* Isolated preview with theme applied */}
        <div style={previewStyle} className="rounded-xl border-2 overflow-hidden">
          <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-6 border-b border-[hsl(var(--border))]">
            <h3 className="text-xl font-bold mb-2">Luxury Villa in Miami</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              This is how your properties and hub page will look
            </p>
          </div>
          <div className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-6 space-y-4">
            <div className="flex gap-2 flex-wrap">
              <button className="px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:opacity-90 transition-opacity">
                Primary Button
              </button>
              <button className="px-4 py-2 rounded-md border-2 border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-medium hover:bg-[hsl(var(--muted))] transition-colors">
                Outline Button
              </button>
              <button className="px-4 py-2 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium hover:opacity-90 transition-opacity">
                Secondary
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">Sample Input</label>
              <input 
                type="text" 
                placeholder="Type something..." 
                className="w-full px-3 py-2 rounded-md border-2 border-[hsl(var(--input))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
              />
            </div>
            <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                This is how text and backgrounds will appear on your public pages
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-[200px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : showSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            "Save Theme"
          )}
        </Button>
      </div>
    </div>
  );
}
