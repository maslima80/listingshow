import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { properties, mediaAssets, propertyAgents } from "@/lib/db/schema";
import { authOptions } from "@/lib/auth";
import { eq, and, notInArray } from "drizzle-orm";
import { uploadToImageKit } from "@/lib/imagekit";
import { uploadToBunny } from "@/lib/bunny";

const updatePropertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  price: z.string().min(1, "Price is required"),
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
  existingMediaIds: z.array(z.string()).default([]),
  existingMediaTitles: z.array(z.object({ id: z.string(), title: z.string() })).default([]),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session.user.teamId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params;

    // Verify property ownership
    const [existingProperty] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, id),
          eq(properties.teamId, session.user.teamId)
        )
      )
      .limit(1);

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
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
      existingMediaIds: JSON.parse(formData.get("existingMediaIds") as string || "[]"),
      existingMediaTitles: JSON.parse(formData.get("existingMediaTitles") as string || "[]"),
    };

    // Validate
    const validated = updatePropertySchema.parse(propertyData);

    // Update property
    await db
      .update(properties)
      .set({
        title: validated.name,
        price: validated.price.replace(/[^0-9.]/g, ''),
        location: validated.location,
        beds: validated.beds ? parseInt(validated.beds) : null,
        baths: validated.baths ? validated.baths : null,
        parking: validated.parking ? parseInt(validated.parking) : null,
        areaSqft: validated.sqft ? validated.sqft.replace(/[^0-9.]/g, '') : null,
        description: validated.description || null,
        amenities: validated.amenities.length > 0 ? validated.amenities : null,
        externalLinks: validated.externalLinks.length > 0 ? validated.externalLinks : null,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id));

    // Update existing media titles
    for (const mediaTitle of validated.existingMediaTitles) {
      await db
        .update(mediaAssets)
        .set({ label: mediaTitle.title })
        .where(eq(mediaAssets.id, mediaTitle.id));
    }

    // Handle media deletion - remove media not in existingMediaIds
    if (validated.existingMediaIds.length > 0) {
      const mediaToDelete = await db
        .select()
        .from(mediaAssets)
        .where(
          and(
            eq(mediaAssets.propertyId, id),
            notInArray(mediaAssets.id, validated.existingMediaIds)
          )
        );

      // Delete from database (ImageKit files will remain in CDN)
      if (mediaToDelete.length > 0) {
        await db
          .delete(mediaAssets)
          .where(
            and(
              eq(mediaAssets.propertyId, id),
              notInArray(mediaAssets.id, validated.existingMediaIds)
            )
          );
      }
    } else {
      // If no existing media IDs, delete all existing media from database
      await db
        .delete(mediaAssets)
        .where(eq(mediaAssets.propertyId, id));
    }

    // Process new media files
    const mediaFiles = formData.getAll("media") as File[];
    const heroMediaId = formData.get("heroMediaId") as string;
    
    const uploadedMedia = [];
    const currentMediaCount = validated.existingMediaIds.length;
    
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
      
      // Upload to ImageKit for photos, Bunny.net for videos
      if (!isVideo) {
        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const result = await uploadToImageKit(
            buffer,
            file.name,
            `/properties/${id}`
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
            id
          );
          
          uploadedUrl = result.streamUrl;
          thumbnailUrl = result.thumbnailUrl;
          bunnyVideoId = result.videoId;
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
          propertyId: id,
          type: isVideo ? "video" : "photo",
          url: uploadedUrl,
          thumbUrl: thumbnailUrl,
          label: mediaTitle || null,
          position: currentMediaCount + i,
          provider: isVideo ? 'bunny' : 'imagekit',
          providerId: isVideo ? bunnyVideoId : imagekitFileId,
        })
        .returning();
      
      uploadedMedia.push(mediaAsset);
      
      // Set as cover if this is the hero
      if (isHero) {
        await db
          .update(properties)
          .set({ coverAssetId: mediaAsset.id })
          .where(eq(properties.id, id));
      }
    }

    // If hero is an existing media, update cover
    if (validated.existingMediaIds.includes(heroMediaId)) {
      await db
        .update(properties)
        .set({ coverAssetId: heroMediaId })
        .where(eq(properties.id, id));
    }

    // Update agent assignments
    // Delete existing assignments
    await db
      .delete(propertyAgents)
      .where(eq(propertyAgents.propertyId, id));

    // Add new assignments
    if (validated.agentIds.length > 0) {
      await db.insert(propertyAgents).values(
        validated.agentIds.map((agentId, index) => ({
          propertyId: id,
          agentProfileId: agentId,
          isPrimary: index === 0,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      message: "Property updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Property update error:", error);
    return NextResponse.json(
      { error: "Failed to update property", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
