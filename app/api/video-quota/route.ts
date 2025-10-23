import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getVideoQuota, getQuotaStatusMessage } from '@/lib/video-quota';

/**
 * GET /api/video-quota
 * Get current video quota usage for the team
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.teamId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const quota = await getVideoQuota(session.user.teamId);
    const status = getQuotaStatusMessage(quota);

    return NextResponse.json({
      ...quota,
      status,
    });
  } catch (error) {
    console.error('Error fetching video quota:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video quota' },
      { status: 500 }
    );
  }
}
