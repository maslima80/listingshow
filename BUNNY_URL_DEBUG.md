# Bunny.net URL Format Debugging

## Current URL Format (What we're using):
```
https://vz-f199acbb-b12.b-cdn.net/debc2ed9-d2ee-4ab3-8084-d56aee5f0c8c/playlist.m3u8
```

## Possible Correct Formats:

### Option 1: Direct CDN (Current)
```
https://vz-f199acbb-b12.b-cdn.net/{videoId}/playlist.m3u8
```

### Option 2: With Library ID
```
https://vz-f199acbb-b12.b-cdn.net/516385/{videoId}/playlist.m3u8
```

### Option 3: Iframe Embed (Not for direct playback)
```
https://iframe.mediadelivery.net/embed/516385/{videoId}
```

### Option 4: Play URL
```
https://vz-f199acbb-b12.b-cdn.net/play/{videoId}
```

## How to Find Correct Format:

1. Go to Bunny.net dashboard
2. Click on your video
3. Look for "Share" or "Embed" button
4. Check the URL format in the embed code
5. Look for the HLS playlist URL

## Test in Browser:

Try opening these URLs in your browser:

1. **Playlist (m3u8):**
   ```
   https://vz-f199acbb-b12.b-cdn.net/debc2ed9-d2ee-4ab3-8084-d56aee5f0c8c/playlist.m3u8
   ```
   Should download or show text file with video segments

2. **Thumbnail:**
   ```
   https://vz-f199acbb-b12.b-cdn.net/debc2ed9-d2ee-4ab3-8084-d56aee5f0c8c/thumbnail.jpg
   ```
   Should show image

3. **With Library ID:**
   ```
   https://vz-f199acbb-b12.b-cdn.net/516385/debc2ed9-d2ee-4ab3-8084-d56aee5f0c8c/playlist.m3u8
   ```

## What to Check in Bunny.net Dashboard:

1. Click on the video
2. Look for "Direct URL" or "Stream URL"
3. Copy the exact URL format
4. Compare with what we're generating

## Common Issues:

### Issue 1: Wrong CDN Hostname
- Check if hostname in .env matches dashboard
- Current: `vz-f199acbb-b12.b-cdn.net`

### Issue 2: Missing Library ID in Path
- Some Bunny.net setups require library ID in URL
- Try: `/{libraryId}/{videoId}/playlist.m3u8`

### Issue 3: Video Not Public
- Check video settings in dashboard
- Make sure "Public" is enabled

### Issue 4: CORS Issues
- Bunny.net should allow CORS by default
- Check browser console for CORS errors

## Next Steps:

1. Test URLs in browser
2. Check Bunny.net dashboard for correct format
3. Update our URL generation code
4. Test video playback
