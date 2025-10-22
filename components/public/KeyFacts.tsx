"use client";

import { Home, Bed, Bath, Maximize, Calendar, DollarSign, MapPin } from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/property-types";

interface KeyFactsProps {
  listingPurpose?: 'sale' | 'rent' | 'coming_soon';
  propertyType?: string | null;
  beds?: number | null;
  baths?: number | null;
  areaSqft?: string | null;
  price: string;
  yearBuilt?: number | null;
  hoaDues?: string | null;
  hoaPeriod?: string | null;
  location: string;
}

export function KeyFacts({
  listingPurpose = 'sale',
  propertyType,
  beds,
  baths,
  areaSqft,
  price,
  yearBuilt,
  hoaDues,
  hoaPeriod,
  location,
}: KeyFactsProps) {
  // Get property type label
  const propertyTypeLabel = PROPERTY_TYPES.find(t => t.value === propertyType)?.label;
  
  // Get listing purpose label
  const listingPurposeLabel = listingPurpose === 'sale' ? 'For Sale' : listingPurpose === 'rent' ? 'For Rent' : 'Coming Soon';

  // Build facts array (only include non-null values)
  const facts = [
    { icon: Home, label: 'Listing', value: listingPurposeLabel },
    propertyTypeLabel && { icon: Home, label: 'Type', value: propertyTypeLabel },
    beds && { icon: Bed, label: 'Beds', value: beds.toString() },
    baths && { icon: Bath, label: 'Baths', value: baths.toString() },
    areaSqft && { icon: Maximize, label: 'Sq Ft', value: Number(areaSqft).toLocaleString() },
    { icon: DollarSign, label: 'Price', value: price },
    yearBuilt && { icon: Calendar, label: 'Built', value: yearBuilt.toString() },
    hoaDues && { icon: DollarSign, label: 'HOA', value: `$${Number(hoaDues).toLocaleString()}/${hoaPeriod || 'month'}` },
    { icon: MapPin, label: 'Location', value: location },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground dark:text-white">
          Key Facts
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {facts.map((fact, index) => {
            const Icon = fact.icon;
            return (
              <div
                key={index}
                className="bg-card dark:bg-slate-800 rounded-lg p-4 border border-border dark:border-slate-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground dark:text-slate-400" />
                  <span className="text-xs font-medium text-muted-foreground dark:text-slate-400 uppercase tracking-wide">
                    {fact.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground dark:text-white">
                  {fact.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
