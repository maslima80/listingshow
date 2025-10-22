import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { properties, mediaAssets, propertyAgents } from "@/lib/db/schema";
import { authOptions } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { uploadToImageKit } from "@/lib/imagekit";
import { uploadToBunny } from "@/lib/bunny";

const createPropertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  listingPurpose: z.enum(['sale', 'rent', 'coming_soon']).default('sale'),
  propertyType: z.enum(['single_family', 'condo', 'townhouse', 'multi_family', 'land', 'lot', 'commercial', 'other']).optional(),
  priceVisibility: z.enum(['show', 'upon_request', 'contact']).default('show'),
  price: z.string().optional(), // Now optional - depends on listing purpose and visibility
  rentPeriod: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  showFullAddress: z.boolean().default(true),
  beds: z.string().optional(),
  baths: z.string().optional(),
  parking: z.string().optional(),
  sqft: z.string().optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  externalLinks: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  agentIds: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session.user.teamId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Extract property data
    const propertyData = {
      name: formData.get("name") as string,
      price: formData.get("price") as string,
      location: formData.get("location") as string,
      showFullAddress: formData.get("showFullAddress") === "true",
      beds: formData.get("beds") as string,
      baths: formData.get("baths") as string,
      parking: formData.get("parking") as string,
      sqft: formData.get("sqft") as string,
      description: formData.get("description") as string,
      amenities: JSON.parse(formData.get("amenities") as string || "[]"),
      externalLinks: JSON.parse(formData.get("externalLinks") as string || "[]"),
      agentIds: JSON.parse(formData.get("agentIds") as string || "[]"),
    };

    // Validate
    const validated = createPropertySchema.parse(propertyData);

    // Generate slug from property name
    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Math.random().toString(36).substring(2, 10);

    // Create property
    const [property] = await db
      .insert(properties)
      .values({
        teamId: session.user.teamId,
        title: validated.name,
        slug: slug,
        listingPurpose: validated.listingPurpose,
        propertyType: validated.propertyType || null,
        priceVisibility: validated.priceVisibility,
        price: validated.price ? validated.price.replace(/[^0-9.]/g, '') : null,
        rentPeriod: validated.rentPeriod || null,
        location: validated.location,
        beds: validated.beds ? parseInt(validated.beds) : null,
        baths: validated.baths ? validated.baths : null,
        parking: validated.parking ? parseInt(validated.parking) : null,
        areaSqft: validated.sqft ? validated.sqft.replace(/[^0-9.]/g, '') : null,
        description: validated.description || null,
        amenities: validated.amenities.length > 0 ? validated.amenities : null,
        externalLinks: validated.externalLinks.length > 0 ? validated.externalLinks : null,
        status: "published",
        publishedAt: new Date(),
      })
      .returning();

    // Process media files
    const mediaFiles = formData.getAll("media") as File[];
    const heroMediaId = formData.get("heroMediaId") as string;
    
    const uploadedMedia = [];
    
    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i];
      const mediaId = formData.get(`mediaId_${i}`) as string;
      const mediaTitle = formData.get(`mediaTitle_${i}`) as string;
      const isHero = mediaId === heroMediaId;
      const isVideo = file.type.startsWith("video/");
      
      let uploadedUrl = "";
      let thumbnailUrl: string | null = null;
      let bunnyVideoId: string | null = null;
      let imagekitFileId: string | null = null;
      let durationSec: number | null = null;
      
      // Upload to ImageKit for photos, Bunny.net for videos
      if (!isVideo) {
        // Upload photos to ImageKit
        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const result = await uploadToImageKit(
            buffer,
            file.name,
            `/properties/${property.id}`
          );
          
          uploadedUrl = result.url;
          imagekitFileId = result.fileId;
        } catch (error) {
          console.error('ImageKit upload failed:', error);
          // Fallback to local storage if ImageKit fails
          uploadedUrl = `/uploads/properties/${file.name}`;
        }
      } else {
        // Upload videos to Bunny.net
        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const result = await uploadToBunny(
            buffer,
            mediaTitle || file.name,
            property.id
          );
          
          uploadedUrl = result.streamUrl;
          thumbnailUrl = result.thumbnailUrl;
          bunnyVideoId = result.videoId;
          durationSec = result.durationSec;
        } catch (error) {
          console.error('Bunny.net upload failed:', error);
          // Fallback to local storage if Bunny.net fails
          uploadedUrl = `/uploads/properties/${file.name}`;
        }
      }
      
      // Create media asset record
      const [mediaAsset] = await db
        .insert(mediaAssets)
        .values({
          propertyId: property.id,
          type: isVideo ? "video" : "photo",
          url: uploadedUrl,
          thumbUrl: thumbnailUrl,
          label: mediaTitle || null,
          position: i,
          provider: isVideo ? 'bunny' : 'imagekit',
          providerId: isVideo ? bunnyVideoId : imagekitFileId,
          durationSec: durationSec,
        })
        .returning();
      
      uploadedMedia.push(mediaAsset);
      
      // Set as cover if this is the hero
      if (isHero) {
        await db
          .update(properties)
          .set({ coverAssetId: mediaAsset.id })
          .where(eq(properties.id, property.id));
      }

      // Schedule automatic duration update for videos (if duration is 0)
      if (isVideo && bunnyVideoId && (!durationSec || durationSec === 0)) {
        // Trigger background job to poll for duration
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/videos/poll-duration`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId: bunnyVideoId,
            mediaAssetId: mediaAsset.id,
          }),
        }).catch(err => console.error('Failed to start duration polling:', err));
      }
    }

    // Link agents to property
    if (validated.agentIds.length > 0) {
      await db.insert(propertyAgents).values(
        validated.agentIds.map((agentId, index) => ({
          propertyId: property.id,
          agentProfileId: agentId,
          isPrimary: index === 0,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        slug: property.slug,
        url: `/p/${property.slug}`,
      },
      mediaCount: uploadedMedia.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Property creation error:", error);
    return NextResponse.json(
      { error: "Failed to create property", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
