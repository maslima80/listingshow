import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToImageKit } from "@/lib/imagekit";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "/properties";
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to ImageKit
    const result = await uploadToImageKit(
      buffer,
      file.name,
      folder
    );
    
    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      filePath: result.filePath,
    });
    
  } catch (error) {
    console.error("ImageKit upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
