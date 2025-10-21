# ImageKit Setup Guide

## 1. Create ImageKit Account

1. Go to [https://imagekit.io/](https://imagekit.io/)
2. Sign up for a free account (10GB storage, 20GB bandwidth/month)
3. Verify your email

## 2. Get Your Credentials

After logging in:

1. Go to **Developer Options** in the left sidebar
2. You'll see three important values:
   - **Public Key** (starts with `public_`)
   - **Private Key** (starts with `private_`)
   - **URL Endpoint** (looks like `https://ik.imagekit.io/your_id`)

## 3. Add to Environment Variables

Add these to your `.env` file:

```env
# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# For client-side (Next.js public variables)
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key_here
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

⚠️ **Important:** 
- Never commit your `.env` file to git
- The `NEXT_PUBLIC_` prefix makes variables available in the browser
- Private key should ONLY be in server-side code

## 4. Features We're Using

### Image Optimization
- **Automatic WebP conversion** - Smaller file sizes
- **Responsive images** - Different sizes for different devices
- **Quality optimization** - Balance between quality and file size
- **Lazy loading** - Images load as user scrolls

### Transformations
```typescript
// Example: Resize to 800px width, auto format, 80% quality
getImageKitUrl('/properties/image.jpg', {
  width: 800,
  format: 'auto',
  quality: 80
})
```

### CDN Benefits
- ✅ Global CDN delivery (fast worldwide)
- ✅ Automatic caching
- ✅ Image optimization on-the-fly
- ✅ No server load for images

## 5. Testing

After adding credentials:

1. Restart your dev server: `npm run dev`
2. Go to property editor
3. Upload a photo
4. Check if it uploads to ImageKit (you'll see it in ImageKit dashboard)
5. View public page - images should load from ImageKit CDN

## 6. Free Tier Limits

- **Storage:** 10 GB
- **Bandwidth:** 20 GB/month
- **Transformations:** Unlimited
- **Media processing:** 20 minutes/month

Perfect for testing and small-scale production!

## 7. Troubleshooting

### "ImageKit URL endpoint not configured"
- Check that environment variables are set correctly
- Restart dev server after adding env vars

### "Failed to upload image"
- Verify your private key is correct
- Check ImageKit dashboard for API errors
- Ensure file size is under 25MB

### Images not loading
- Check browser console for errors
- Verify URL endpoint is correct
- Check ImageKit dashboard to see if files uploaded

## Next Steps

Once ImageKit is working:
1. ✅ Test with multiple images
2. ✅ Test different image sizes
3. ✅ Check CDN performance
4. 🎬 Move to Bunny.net for video hosting
