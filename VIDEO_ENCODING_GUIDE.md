# Video Encoding Guide

## 🎬 How Bunny.net Video Encoding Works

When you upload a video to your property, here's what happens:

### **Step 1: Upload** ✅
- Video uploads to Bunny.net immediately
- Thumbnail is generated
- You see the thumbnail in the property editor

### **Step 2: Encoding** ⏳ (1-5 minutes)
- Bunny.net encodes your video to multiple resolutions:
  - 360p (mobile)
  - 480p (SD)
  - 720p (HD)
  - 1080p (Full HD)
- Creates HLS stream for adaptive playback
- This takes **1-5 minutes** depending on video length

### **Step 3: Ready** ✅
- Video is ready to stream
- Works on all devices
- Adaptive quality based on connection speed

## 📊 Video Status in Bunny.net Dashboard

Check your video status:

1. Go to [Bunny.net Dashboard](https://dash.bunny.net)
2. Click **Stream** → Your video library
3. Find your video
4. Check the status:

| Status | What It Means | What You See |
|--------|---------------|--------------|
| **Queued** | Waiting to encode | Thumbnail only |
| **Processing** | Encoding started | Thumbnail only |
| **Encoding** | Almost done | Thumbnail only |
| **Finished** | Ready to stream! | Video plays ✅ |

## 🎯 What Users See

### **While Encoding (1-5 min):**
- ✅ Thumbnail shows on property page
- ⏳ Clicking video shows "Video Processing" message
- 💡 Message: "Please wait 1-5 minutes and refresh the page"

### **After Encoding:**
- ✅ Thumbnail shows
- ✅ Video plays when clicked
- ✅ Smooth streaming on all devices

## 🧪 Testing Your Videos

### **Test 1: Upload**
1. Upload video in property editor
2. **Should see:** Thumbnail appears immediately ✅
3. **Should see:** Video marked as "Hero" if selected ✅

### **Test 2: Encoding Status**
1. Go to Bunny.net dashboard
2. Check video status
3. **Should see:** "Processing" or "Encoding" ⏳
4. **Wait:** 1-5 minutes

### **Test 3: Playback**
1. After encoding finishes
2. Refresh property page
3. Click video
4. **Should see:** Video plays smoothly ✅

## ⚠️ Common Issues

### **Issue: Black screen when clicking video**
**Cause:** Video still encoding  
**Solution:** Wait 1-5 minutes, refresh page  
**Now shows:** "Video Processing" message instead of black screen ✅

### **Issue: 404 error in console**
**Cause:** Video stream not ready yet  
**Solution:** Normal! Wait for encoding to finish  
**Status:** Handled gracefully with error message ✅

### **Issue: Video won't play after 10+ minutes**
**Cause:** Encoding may have failed  
**Solution:**
1. Check Bunny.net dashboard
2. Look for error status
3. Re-upload video if needed

## 🚀 Best Practices

### **For Best Results:**
1. **Video Format:** MP4, MOV, AVI (most formats work)
2. **Video Length:** Under 5 minutes for fastest encoding
3. **File Size:** Under 500MB for best upload speed
4. **Resolution:** 1080p or lower (higher gets downscaled)

### **Recommended Workflow:**
1. Upload video
2. Continue editing property (add photos, description, etc.)
3. By the time you're done, video is encoded ✅
4. Publish property
5. Video ready to stream!

## 📱 Mobile Optimization

Bunny.net automatically optimizes for mobile:
- ✅ Lower resolution on slow connections
- ✅ Higher resolution on fast connections
- ✅ Adaptive bitrate streaming
- ✅ Works on iOS and Android
- ✅ No buffering issues

## 💰 Encoding Costs

**Free Tier:**
- 100 GB storage
- 500 GB bandwidth/month
- Unlimited encoding

**Pay-as-you-go:**
- Storage: $0.01/GB/month
- Bandwidth: $0.01/GB
- Encoding: FREE ✅

## 🎬 Video Quality

Bunny.net creates these versions:
- **360p** - 1 Mbps (mobile, slow connections)
- **480p** - 2.5 Mbps (SD quality)
- **720p** - 5 Mbps (HD quality)
- **1080p** - 8 Mbps (Full HD)

Player automatically picks best quality for user's connection!

## ✅ Summary

1. Upload video → Instant ✅
2. Encoding → 1-5 minutes ⏳
3. Ready to stream → Forever ✅

**No action needed from you - it's all automatic!** 🎉
