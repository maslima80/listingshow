/**
 * Video Quota Management
 * Track and enforce video upload limits based on subscription plans
 */

import { db } from '@/lib/db';
import { teams, subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get team's video quota usage and limit
 */
export async function getVideoQuota(teamId: string): Promise<{
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
}> {
  try {
    // Get team's current usage
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      throw new Error('Team not found');
    }

    // Get subscription limit
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.teamId, teamId),
    });

    const limit = subscription?.videoMinutesLimit || 30; // Default to 30 minutes
    const used = team.videoMinutesUsed || 0;
    const remaining = Math.max(0, limit - used);
    const percentage = limit > 0 ? Math.round((used / limit) * 100) : 0;

    return {
      used,
      limit,
      remaining,
      percentage,
    };
  } catch (error) {
    console.error('Error getting video quota:', error);
    throw error;
  }
}

/**
 * Check if team can upload a video of given duration
 */
export async function canUploadVideo(
  teamId: string,
  durationMinutes: number
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const quota = await getVideoQuota(teamId);

    if (durationMinutes > quota.remaining) {
      return {
        allowed: false,
        reason: `Not enough quota. You have ${quota.remaining} minutes remaining, but this video is ${durationMinutes} minutes.`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking video upload permission:', error);
    return {
      allowed: false,
      reason: 'Failed to check quota',
    };
  }
}

/**
 * Add video minutes to team's usage
 */
export async function addVideoMinutes(
  teamId: string,
  durationMinutes: number
): Promise<void> {
  try {
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      throw new Error('Team not found');
    }

    const newUsage = (team.videoMinutesUsed || 0) + durationMinutes;

    await db
      .update(teams)
      .set({ videoMinutesUsed: newUsage })
      .where(eq(teams.id, teamId));

    console.log(`Added ${durationMinutes} minutes to team ${teamId}. New total: ${newUsage}`);
  } catch (error) {
    console.error('Error adding video minutes:', error);
    throw error;
  }
}

/**
 * Subtract video minutes from team's usage (when deleting videos)
 */
export async function subtractVideoMinutes(
  teamId: string,
  durationMinutes: number
): Promise<void> {
  try {
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      throw new Error('Team not found');
    }

    const newUsage = Math.max(0, (team.videoMinutesUsed || 0) - durationMinutes);

    await db
      .update(teams)
      .set({ videoMinutesUsed: newUsage })
      .where(eq(teams.id, teamId));

    console.log(`Subtracted ${durationMinutes} minutes from team ${teamId}. New total: ${newUsage}`);
  } catch (error) {
    console.error('Error subtracting video minutes:', error);
    throw error;
  }
}

/**
 * Get quota status message for UI
 */
export function getQuotaStatusMessage(quota: {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
}): { message: string; variant: 'default' | 'warning' | 'destructive' } {
  if (quota.percentage >= 90) {
    return {
      message: `⚠️ Almost out of video quota! ${quota.remaining} minutes remaining.`,
      variant: 'destructive',
    };
  }

  if (quota.percentage >= 75) {
    return {
      message: `You have ${quota.remaining} minutes of video quota remaining.`,
      variant: 'warning',
    };
  }

  return {
    message: `${quota.remaining} of ${quota.limit} minutes available.`,
    variant: 'default',
  };
}

/**
 * Convert seconds to minutes (rounded up)
 */
export function secondsToMinutes(seconds: number): number {
  return Math.ceil(seconds / 60);
}

/**
 * Format minutes for display
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}
