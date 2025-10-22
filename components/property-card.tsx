"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, Trash2, LayoutGrid, Loader2, Edit } from "lucide-react";
import { formatPriceDisplay, type ListingPurpose, type PriceVisibility } from "@/lib/property-types";

interface PropertyCardProps {
  property: {
    id: string;
    slug: string;
    title: string;
    listingPurpose: ListingPurpose;
    priceVisibility: PriceVisibility;
    price: string | null;
    rentPeriod: string | null;
    location: string;
    beds: number | null;
    baths: string | number | null;
    areaSqft: string | null;
    status: string;
  };
  coverMedia?: {
    url: string;
    type: string;
    thumbUrl?: string | null;
  } | null;
}

export function PropertyCard({ property, coverMedia }: PropertyCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/properties/${property.id}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete property");
      }

      // Refresh the page to show updated list
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete property. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-200 overflow-hidden">
        {/* Property Image */}
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          {coverMedia?.url ? (
            <img
              src={coverMedia.type === 'video' && coverMedia.thumbUrl ? coverMedia.thumbUrl : coverMedia.url}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <LayoutGrid className="w-12 h-12" />
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={property.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}>
              {property.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>

        {/* Property Info */}
        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-1">{property.title}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            {property.listingPurpose === 'coming_soon' ? (
              <Badge variant="secondary" className="text-sm">Coming soon</Badge>
            ) : property.priceVisibility !== 'show' ? (
              <span className="text-sm italic text-muted-foreground">
                {formatPriceDisplay(property.listingPurpose, property.priceVisibility, property.price, property.rentPeriod)}
              </span>
            ) : (
              <span className="text-lg font-bold text-primary">
                {formatPriceDisplay(property.listingPurpose, property.priceVisibility, property.price, property.rentPeriod)}
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Property Stats */}
          {(property.beds || property.baths || property.areaSqft) && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              {property.beds && <span>{property.beds} beds</span>}
              {property.baths && <span>• {property.baths} baths</span>}
              {property.areaSqft && <span>• {Number(property.areaSqft).toLocaleString()} sqft</span>}
            </div>
          )}

          {/* Location */}
          {property.location && (
            <p className="text-sm text-slate-600 line-clamp-1 flex items-center gap-1">
              <span className="text-slate-400">📍</span>
              {property.location}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Link href={`/p/${property.slug}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </Link>
            <Link href={`/dashboard/properties/${property.id}/edit`}>
              <Button variant="default" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{property.title}</strong>? This action cannot be undone.
              All media and data associated with this property will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Property"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
