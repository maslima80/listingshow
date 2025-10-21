# Automatic Video Duration Updates

## Overview
Videos now automatically update their duration after Bunny.net finishes encoding.

## How It Works

### 1. Upload Flow
```
User uploads video
    ↓
Video sent to Bunny.net
    ↓
Initial duration = 0 (encoding not complete)
    ↓
Video saved to database
    ↓
🔄 Automatic polling starts
```

### 2. Automatic Polling
```
Poll every 30 seconds
    ↓
Check Bunny API for duration
    ↓
Duration available? → Update database ✅
    ↓
Not yet? → Keep polling (max 10 attempts = 5 minutes)
```

### 3. User Experience
- **Upload:** Video shows `...` (encoding)
- **1-5 minutes later:** Duration automatically updates to `0:15`, `1:23`, etc.
- **No manual refresh needed** (on next page load)

## Technical Details

### Files Modified

#### `/app/api/properties/create/route.ts`
- Triggers automatic polling after video upload
- Only polls if `durationSec = 0`
- Non-blocking (doesn't slow down upload response)

#### `/app/api/videos/poll-duration/route.ts` (NEW)
- Background polling endpoint
- Polls every 30 seconds for up to 5 minutes
- Automatically updates database when duration available
- Logs progress to console

### Polling Strategy

**Timing:**
- Initial delay: 10 seconds (let encoding start)
- Poll interval: 30 seconds
- Max attempts: 10 (total 5 minutes)

**Stops When:**
- ✅ Duration > 0 (success)
- ✅ Status = 4 & Progress = 100% (encoded)
- ⏱️ Max attempts reached

### Console Logs

You'll see logs like:
```
[Duration Polling] Started for video 8e5e5982-5d95-4466-ba69-86cb822e761a
[Duration Polling] Video 8e5e5982... - Duration: 0s, Progress: 45%, Status: 3, Attempt: 1/10
[Duration Polling] Video 8e5e5982... - Duration: 15s, Progress: 100%, Status: 4, Attempt: 3/10
[Duration Polling] ✅ Updated video 8e5e5982... with duration 15s
```

## Testing

### Test New Upload:
1. Upload a video
2. Check terminal logs - should see polling start
3. Wait 1-2 minutes
4. Refresh property page
5. Duration should show correctly

### Test Existing Videos:
```bash
# Update all videos with missing durations
curl -X POST http://localhost:3000/api/videos/update-all-durations
```

## Benefits

✅ **Automatic** - No manual intervention needed
✅ **Non-blocking** - Doesn't slow down uploads
✅ **Reliable** - Retries up to 10 times
✅ **Logged** - Easy to debug
✅ **Efficient** - Only polls videos with duration = 0

## Future Enhancements

### Possible Improvements:
1. **Real-time updates** - WebSocket to push updates to client
2. **Progress indicator** - Show encoding progress in UI
3. **Retry failed videos** - Cron job to check old videos
4. **Webhook** - Bunny.net webhook for instant updates
5. **Toast notifications** - Alert user when encoding completes

## Troubleshooting

### Video still shows "..." after 5 minutes:
```bash
# Check Bunny API directly
curl "http://localhost:3000/api/debug/bunny-video?videoId=YOUR_VIDEO_ID"

# Manually update
curl -X POST http://localhost:3000/api/videos/update-duration \
  -H "Content-Type: application/json" \
  -d '{"videoId":"YOUR_VIDEO_ID","mediaAssetId":"YOUR_ASSET_ID"}'
```

### Check polling logs:
Look for `[Duration Polling]` in your terminal/server logs

### Database check:
```bash
curl http://localhost:3000/api/debug/videos | jq '.videos[] | {label, durationSec}'
```
