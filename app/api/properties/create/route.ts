import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { properties, mediaAssets, propertyAgents } from "@/lib/db/schema";
import { authOptions } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { writeFile } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

const createPropertySchema = z.object({
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
      agentIds: JSON.parse(formData.get("agentIds") as string || "[]"),
    };

    // Validate
    const validated = createPropertySchema.parse(propertyData);

    // Generate slug from property name
    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + crypto.randomBytes(4).toString("hex");

    // Create property
    const [property] = await db
      .insert(properties)
      .values({
        teamId: session.user.teamId,
        title: validated.name,
        slug: slug,
        price: validated.price.replace(/[^0-9.]/g, ''), // Remove non-numeric characters
        location: validated.location,
        beds: validated.beds ? parseInt(validated.beds) : null,
        baths: validated.baths ? parseInt(validated.baths) : null,
        parking: validated.parking ? parseInt(validated.parking) : null,
        areaSqft: validated.sqft ? validated.sqft.replace(/[^0-9.]/g, '') : null,
        description: validated.description || null,
        amenities: validated.amenities.length > 0 ? validated.amenities : null,
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
      const isHero = mediaId === heroMediaId;
      
      // Generate unique filename
      const ext = file.name.split(".").pop();
      const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
      const filepath = join(process.cwd(), "public", "uploads", "properties", filename);
      
      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);
      
      // Create media asset record
      const [mediaAsset] = await db
        .insert(mediaAssets)
        .values({
          propertyId: property.id,
          type: file.type.startsWith("video/") ? "video" : "photo",
          url: `/uploads/properties/${filename}`,
          position: i,
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
