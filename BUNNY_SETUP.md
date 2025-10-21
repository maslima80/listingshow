# Bunny.net Stream Setup Guide

## 1. Create Bunny.net Account

1. Go to [https://bunny.net/](https://bunny.net/)
2. Sign up for an account
3. Verify your email

## 2. Create Stream Video Library

1. Login to Bunny.net dashboard
2. Go to **Stream** in the left sidebar
3. Click **Add Video Library**
4. Configure:
   - **Name:** "Listing Show Properties" (or your choice)
   - **Replication Regions:** Select regions closest to your users
   - **Player Settings:** Enable as needed
5. Click **Add Video Library**

## 3. Get Your Credentials

After creating the library:

1. Click on your video library name
2. Go to **API** tab
3. You'll see:
   - **Library ID** (numeric, e.g., `12345`)
   - **API Key** (long string)
4. Go to **CDN** tab
5. Copy the **CDN Hostname** (e.g., `vz-abc123.b-cdn.net`)

## 4. Add to Environment Variables

Add these to your `.env` file:

```env
# Bunny.net Stream Configuration
BUNNY_STREAM_API_KEY=your_api_key_here
BUNNY_LIBRARY_ID=12345
BUNNY_CDN_HOSTNAME=vz-abc123.b-cdn.net
```

⚠️ **Important:** Never commit these to git!

## 5. Features We're Using

### Video Upload
- Automatic encoding to multiple resolutions (360p, 480p, 720p, 1080p)
- Adaptive bitrate streaming (HLS)
- Automatic thumbnail generation
- Fast global CDN delivery

### Video Streaming
- HLS (HTTP Live Streaming) for adaptive quality
- Works on all devices (iOS, Android, Desktop)
- Automatic quality switching based on connection
- Low latency playback

### Benefits
- ✅ 99.9% uptime SLA
- ✅ Global CDN with 100+ locations
- ✅ Automatic video optimization
- ✅ Mobile-first streaming
- ✅ Pay-as-you-go pricing
- ✅ No storage limits

## 6. Pricing (as of 2024)

**Free Tier:**
- 100 GB storage
- 500 GB bandwidth/month
- Perfect for testing!

**Pay-as-you-go:**
- Storage: $0.01/GB/month
- Bandwidth: $0.01/GB
- Very affordable for real estate videos

## 7. How It Works

### Upload Flow:
1. User uploads video in property editor
2. Video sent to our API
3. API uploads to Bunny.net Stream
4. Bunny.net encodes video (takes 1-5 minutes)
5. Returns video ID
6. We save video ID to database

### Playback Flow:
1. User visits property page
2. We load video ID from database
3. Generate Bunny.net stream URL
4. Video player streams from Bunny.net CDN
5. Adaptive quality based on connection speed

## 8. Testing

After adding credentials:

1. Restart dev server: `npm run dev`
2. Go to property editor
3. Upload a video
4. Check Bunny.net dashboard - video should appear
5. View public page - video should stream from Bunny.net
6. Check browser network tab - URL should be `vz-*.b-cdn.net`

## 9. Video Encoding Status

Videos go through these states:
- **0** - Queued
- **1** - Processing
- **2** - Encoding
- **3** - Finished
- **4** - Failed

Our app will handle encoding progress and show status to users.

## 10. Troubleshooting

### "Bunny.net credentials not configured"
- Check that all 3 env vars are set
- Restart dev server after adding vars

### "Failed to upload video"
- Check API key is correct
- Verify library ID is numeric
- Check video file size (max 5GB)

### Video not playing
- Wait 1-5 minutes for encoding to complete
- Check Bunny.net dashboard for encoding status
- Verify CDN hostname is correct

## 11. Advanced Features (Future)

- **Collections:** Organize videos by property
- **Captions:** Add subtitles
- **Chapters:** Video timeline markers
- **Analytics:** View counts, watch time
- **DRM:** Content protection
- **Watermarks:** Brand videos

## Next Steps

Once Bunny.net is working:
1. ✅ Test video uploads
2. ✅ Test video streaming
3. ✅ Check encoding progress
4. 🎬 Launch to production!
