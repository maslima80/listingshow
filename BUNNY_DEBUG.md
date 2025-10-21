# Bunny.net Debugging Guide

## Current Error: "Collection does not exist"

This error happens even though we removed the collectionId. Let's debug:

## Step 1: Verify Your Credentials

Check your `.env` file has these **exact** variable names:

```env
BUNNY_STREAM_API_KEY=your_key_here
BUNNY_LIBRARY_ID=12345
BUNNY_CDN_HOSTNAME=vz-abc123.b-cdn.net
```

⚠️ **Common Issues:**
- Extra spaces around the `=` sign
- Quotes around values (remove them)
- Wrong variable names
- Library ID is text instead of number

## Step 2: Verify Library ID

1. Go to Bunny.net dashboard
2. Click **Stream** → Your video library
3. Look at the URL: `https://dash.bunny.net/stream/library/12345`
4. The number at the end is your Library ID
5. Make sure it matches your `.env` file

## Step 3: Verify API Key

1. In your video library, click **API** tab
2. Copy the API Key (long string)
3. Make sure it matches your `.env` file exactly
4. No extra spaces or line breaks

## Step 4: Test API Connection

Let's test if your credentials work. Create a test file:

```typescript
// test-bunny.ts
const BUNNY_STREAM_API_KEY = 'your_key';
const BUNNY_LIBRARY_ID = '12345';

async function testBunny() {
  const response = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
    {
      method: 'GET',
      headers: {
        'AccessKey': BUNNY_STREAM_API_KEY,
      },
    }
  );
  
  console.log('Status:', response.status);
  console.log('Response:', await response.text());
}

testBunny();
```

Run: `npx tsx test-bunny.ts`

**Expected result:**
- Status: 200
- Response: List of videos (or empty array)

**If you get 401/403:**
- API key is wrong

**If you get 404:**
- Library ID is wrong

## Step 5: Check for Typos

Common typos in `.env`:
```env
# ❌ WRONG
BUNNY_STREAM_API_KEY = "abc123"  # No quotes!
BUNNY_LIBRARY_ID = "12345"       # No quotes!
BUNNY_CDN_HOSTNAME = vz-abc.b-cdn.net  # Missing subdomain?

# ✅ CORRECT
BUNNY_STREAM_API_KEY=abc123
BUNNY_LIBRARY_ID=12345
BUNNY_CDN_HOSTNAME=vz-abc123.b-cdn.net
```

## Step 6: Restart Everything

After fixing `.env`:
1. Stop dev server (Ctrl+C)
2. Clear Next.js cache: `rm -rf .next`
3. Restart: `npm run dev`

## Step 7: Check Bunny.net Dashboard

1. Go to your video library
2. Check if there's a "Default Collection"
3. If yes, note its ID
4. We might need to use that

## Still Not Working?

Send me:
1. Your Library ID (from Bunny.net dashboard URL)
2. First 10 characters of your API key
3. Your CDN hostname
4. Screenshot of Bunny.net library settings

I'll help debug further!
