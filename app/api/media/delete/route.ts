import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteFromBunny } from '@/lib/bunny';
import { subtractVideoMinutes } from '@/lib/video-quota';

/**
 * POST /api/media/delete
 * Delete video from Bunny.net and update quota
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

    const { videoId, durationMinutes } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Delete from Bunny.net
    await deleteFromBunny(videoId);

    // Subtract from quota if duration provided
    if (durationMinutes && durationMinutes > 0) {
      await subtractVideoMinutes(session.user.teamId, durationMinutes);
    }

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error: any) {
    console.error('Video delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete video' },
      { status: 500 }
    );
  }
}
