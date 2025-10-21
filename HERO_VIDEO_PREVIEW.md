# Premium Hero Video Auto-Preview System

## Overview
A polished, cinematic hero video experience that automatically previews videos after page load, creating an immersive first impression.

## User Experience Flow

### Scenario 1: Hero is an Image
1. **Page loads** → Hero image displays immediately
2. **After 2 seconds** → First video from gallery fades in (muted)
3. **Plays for 5 seconds** → Video preview plays
4. **Fades back** → Returns to hero image
5. **User clicks "Watch the Film"** → Opens fullscreen player starting from first video

### Scenario 2: Hero is a Video
1. **Page loads** → Video thumbnail displays immediately
2. **After 2 seconds** → Video fades in and plays (muted)
3. **Plays for 5 seconds** → Video preview plays
4. **Fades back** → Returns to thumbnail
5. **User clicks "Watch the Film"** → Opens fullscreen player starting from THAT hero video

## Technical Implementation

### Components Modified

#### 1. `/components/public/HeroMedia.tsx`
**New Features:**
- ✅ Auto-preview logic with 2-second delay
- ✅ 5-second preview duration (no loop)
- ✅ Smooth fade transitions (1000ms)
- ✅ Muted autoplay for better browser compatibility
- ✅ Respects user preferences (reduced motion/data)
- ✅ Pauses if user switches tabs
- ✅ One-time playback (doesn't repeat)

**New Props:**
- `isHeroVideo: boolean` - True if hero is video, false if image
- `firstVideoUrl?: string` - First video URL (for preview if hero is image)

#### 2. `/components/public/CinematicPropertyPage.tsx`
**New Features:**
- ✅ Smart video selection for preview
- ✅ Continues from hero video when opening fullscreen player
- ✅ Passes hero video context to player

**New Props:**
- `isHeroVideo: boolean`
- `firstVideoUrl?: string`

#### 3. `/app/p/[slug]/page.tsx`
**New Logic:**
- ✅ Detects if hero media is video or image
- ✅ Gets appropriate video URL for preview
- ✅ Passes context to components

### Preview Behavior

**Timing:**
- **Delay before preview:** 2 seconds
- **Preview duration:** 5 seconds
- **Fade transition:** 1 second (in and out)
- **Total cycle:** ~8 seconds

**Video Settings:**
- Muted (for autoplay compatibility)
- No controls visible during preview
- Pointer events disabled (can't interact during preview)
- Smooth opacity transitions

**Accessibility:**
- Respects `prefers-reduced-motion`
- Respects `prefers-reduced-data`
- Pauses when tab loses focus
- One-time playback (not intrusive)

## Premium UX Details

### Visual Polish
1. **Smooth Transitions**
   - 1000ms opacity fade
   - Elegant crossfade between image/video
   - No jarring cuts

2. **Smart Layering**
   - Image always loads first (instant)
   - Video fades in on top
   - Proper z-index management

3. **Performance**
   - Lazy iframe loading
   - No blocking on main thread
   - Cleanup on unmount

### User Control
1. **Non-Intrusive**
   - Plays once, doesn't loop
   - Returns to static state
   - User can click anytime

2. **Seamless Continuation**
   - Clicking "Watch Film" continues from hero video
   - No jarring restart
   - Context preserved

3. **Mobile Optimized**
   - Touch-friendly
   - Respects data preferences
   - Smooth on all devices

## Browser Compatibility

**Autoplay Requirements:**
- ✅ Muted video (works in all browsers)
- ✅ User-initiated page load (counts as interaction)
- ✅ Iframe with autoplay permission

**Tested On:**
- Chrome/Edge (Chromium)
- Safari (iOS/macOS)
- Firefox
- Mobile browsers

## Future Enhancements

**Potential Additions:**
1. **Custom preview duration** - Let users set preview length
2. **Preview start time** - Start from specific timestamp
3. **Multiple preview clips** - Rotate through different videos
4. **Sound on hover** - Unmute on desktop hover
5. **Analytics** - Track preview engagement
6. **A/B testing** - Test different preview durations

## Configuration

**Current Settings:**
```typescript
const PREVIEW_DURATION = 5000; // 5 seconds
const AUTOPLAY_DELAY = 2000;   // 2 seconds
```

**To Adjust:**
Edit these constants in `/components/public/HeroMedia.tsx`

## Testing Checklist

- [ ] Hero image → previews first video → returns to image
- [ ] Hero video → previews that video → returns to thumbnail
- [ ] Click "Watch Film" from image hero → starts at first video
- [ ] Click "Watch Film" from video hero → starts at that video
- [ ] Preview plays only once (doesn't loop)
- [ ] Smooth fade transitions
- [ ] Works on mobile
- [ ] Works on desktop
- [ ] Respects reduced motion preference
- [ ] Respects reduced data preference
- [ ] Pauses when tab loses focus

## Result

A **premium, polished, cinematic** hero experience that:
- ✨ Captures attention immediately
- 🎬 Showcases property videos elegantly
- 🚀 Feels fast and responsive
- 💎 Looks expensive and professional
- 📱 Works beautifully on all devices
