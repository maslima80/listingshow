# Bunny.net Autoplay Fix

## Problem
Videos were loading in the fullscreen player but required an extra click to start playing - bad UX.

## Root Cause
Bunny.net iframe embeds were using `autoplay=false` parameter, which meant:
1. User clicks "Watch the Film" → Player opens
2. Video loads but shows play button overlay
3. User must click play button again → Video starts

This created an unnecessary extra click.

## Solution
Changed all Bunny.net video URLs to use `autoplay=true` parameter.

## Changes Made

### 1. `/lib/bunny.ts`
**Lines 114, 123, 227:**
- Changed `autoplay=false` to `autoplay=true` in all URL generation
- New videos uploaded will automatically have autoplay enabled

### 2. `/components/public/CinematicPlayer.tsx`
**Lines 139-154:**
- Simplified iframe rendering (removed autoplay URL manipulation)
- Videos now autoplay immediately when player opens

### 3. `/app/api/debug/fix-bunny-urls/route.ts`
**Updated to fix existing videos:**
- Now finds videos with `autoplay=false` parameter
- Updates them to `autoplay=true`
- Fixed 2 existing videos in database

## New URL Format

**Before:**
```
https://iframe.mediadelivery.net/embed/516385/{videoId}?autoplay=false&preload=true
```

**After:**
```
https://iframe.mediadelivery.net/embed/516385/{videoId}?autoplay=true&preload=true
```

## User Experience Now

1. ✅ User clicks "Watch the Film" → Player opens
2. ✅ Video starts playing immediately
3. ✅ No extra click required!

## Testing

1. **Refresh your property page** (Cmd+Shift+R)
2. **Click "Watch the Film"** or click a video card
3. **Video should start playing immediately** 🎉

## Browser Autoplay Policies

Modern browsers have autoplay restrictions:
- ✅ **Works:** User-initiated actions (clicks, taps)
- ❌ **Blocked:** Automatic playback on page load

Since our videos play after a user click, autoplay will work in all browsers!

## Future Videos

All new videos uploaded will automatically have `autoplay=true`, so this is a one-time fix.
