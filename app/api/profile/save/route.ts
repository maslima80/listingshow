import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { agentProfiles } from "@/lib/db/schema";
import { authOptions } from "@/lib/auth";
import { eq } from "drizzle-orm";

const profileSchema = z.object({
  profileId: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  title: z.string(),
  tagline: z.string().optional(),
  bio: z.string().max(300),
  bioLong: z.string().max(1000).optional(),
  videoUrl: z.string().optional(),
  videoId: z.string().optional(),
  videoThumbnail: z.string().optional(),
  email: z.string().email("Invalid email"),
  phone: z.string(),
  whatsapp: z.string(),
  photoUrl: z.string(),
  calendlyUrl: z.string().optional(),
  useInternalScheduling: z.boolean().optional(),
  socialLinks: z.record(z.string(), z.string()),
  statsJson: z.object({
    yearsExperience: z.number().optional(),
    homesSold: z.string().optional(),
    salesVolume: z.string().optional(),
  }).optional(),
  credentials: z.array(z.string()).optional(),
  serviceAreas: z.array(z.string()).optional(),
  brokerageName: z.string().optional(),
  licenseNumber: z.string().optional(),
  disclosureText: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = profileSchema.parse(body);

    // Prepare socialLinks - filter out empty values
    const cleanedSocialLinks = Object.entries(data.socialLinks || {})
      .filter(([_, value]) => value && value.trim() !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const socialLinksToSave = Object.keys(cleanedSocialLinks).length > 0 
      ? cleanedSocialLinks 
      : null;

    // Update existing profile
    if (data.profileId) {
      await db
        .update(agentProfiles)
        .set({
          name: data.name,
          title: data.title || null,
          tagline: data.tagline || null,
          bio: data.bio || null,
          bioLong: data.bioLong || null,
          videoUrl: data.videoUrl || null,
          videoId: data.videoId || null,
          videoThumbnail: data.videoThumbnail || null,
          email: data.email,
          phone: data.phone || null,
          whatsapp: data.whatsapp || null,
          photoUrl: data.photoUrl || null,
          calendlyUrl: data.calendlyUrl || null,
          useInternalScheduling: data.useInternalScheduling || false,
          socialLinks: socialLinksToSave,
          statsJson: data.statsJson || null,
          credentials: data.credentials || null,
          serviceAreas: data.serviceAreas || null,
          brokerageName: data.brokerageName || null,
          licenseNumber: data.licenseNumber || null,
          disclosureText: data.disclosureText || null,
          updatedAt: new Date(),
        })
        .where(eq(agentProfiles.id, data.profileId));

      return NextResponse.json({
        success: true,
        message: "Profile updated",
      });
    }

    // Create new profile
    const [newProfile] = await db
      .insert(agentProfiles)
      .values({
        teamId: session.user.teamId!,
        userId: session.user.id,
        name: data.name,
        title: data.title || null,
        tagline: data.tagline || null,
        bio: data.bio || null,
        bioLong: data.bioLong || null,
        videoUrl: data.videoUrl || null,
        videoId: data.videoId || null,
        videoThumbnail: data.videoThumbnail || null,
        email: data.email,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        photoUrl: data.photoUrl || null,
        calendlyUrl: data.calendlyUrl || null,
        useInternalScheduling: data.useInternalScheduling || false,
        socialLinks: socialLinksToSave,
        statsJson: data.statsJson || null,
        credentials: data.credentials || null,
        serviceAreas: data.serviceAreas || null,
        brokerageName: data.brokerageName || null,
        licenseNumber: data.licenseNumber || null,
        disclosureText: data.disclosureText || null,
        isVisible: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Profile created",
      profileId: newProfile.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Profile save error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json(
      { error: "Failed to save profile", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
