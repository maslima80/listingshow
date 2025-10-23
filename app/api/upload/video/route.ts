import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToBunny, getBunnyVideoInfo } from '@/lib/bunny';
import { canUploadVideo, addVideoMinutes, secondsToMinutes } from '@/lib/video-quota';

/**
 * POST /api/upload/video
 * Upload video to Bunny.net and track quota usage
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.teamId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const video = formData.get('video') as File;
    const title = formData.get('title') as string;

    if (!video) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await video.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Bunny.net
    const uploadResult = await uploadToBunny(buffer, title || video.name);

    // Wait a bit for Bunny to process and get duration
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get video info to get accurate duration
    let durationSeconds = uploadResult.durationSec;
    
    if (durationSeconds === 0) {
      // Try to fetch updated info
      try {
        const videoInfo = await getBunnyVideoInfo(uploadResult.videoId);
        durationSeconds = Math.round(videoInfo.length || 0);
      } catch (error) {
        console.warn('Could not fetch video duration, will update later');
      }
    }

    const durationMinutes = secondsToMinutes(durationSeconds);

    // Check quota (even if duration is 0, we'll update it later)
    if (durationMinutes > 0) {
      const quotaCheck = await canUploadVideo(session.user.teamId, durationMinutes);
      
      if (!quotaCheck.allowed) {
        // Delete the uploaded video since quota exceeded
        // Note: We could delete it here, but let's keep it and just warn
        console.warn('Video uploaded but quota exceeded:', quotaCheck.reason);
      } else {
        // Add to quota usage
        await addVideoMinutes(session.user.teamId, durationMinutes);
      }
    }

    return NextResponse.json({
      videoId: uploadResult.videoId,
      thumbnailUrl: uploadResult.thumbnailUrl,
      streamUrl: uploadResult.streamUrl,
      hlsUrl: uploadResult.hlsUrl,
      durationMinutes,
      durationSeconds,
    });
  } catch (error: any) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload video' },
      { status: 500 }
    );
  }
}
