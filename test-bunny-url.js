// Test if Bunny.net video URL is accessible
// Run with: node test-bunny-url.js <videoId>

const videoId = process.argv[2];

if (!videoId) {
  console.log('Usage: node test-bunny-url.js <videoId>');
  console.log('Example: node test-bunny-url.js debc2ed9-d2ee-4ab3-8084-d56aee5f0c8c');
  process.exit(1);
}

const CDN_HOSTNAME = 'vz-f199acbb-b12.b-cdn.net';
const streamUrl = `https://${CDN_HOSTNAME}/${videoId}/playlist.m3u8`;
const thumbnailUrl = `https://${CDN_HOSTNAME}/${videoId}/thumbnail.jpg`;

console.log('\n🎬 Testing Bunny.net URLs...\n');
console.log('Video ID:', videoId);
console.log('Stream URL:', streamUrl);
console.log('Thumbnail URL:', thumbnailUrl);
console.log('\n');

// Test stream URL
fetch(streamUrl)
  .then(res => {
    console.log('✅ Stream URL Status:', res.status);
    if (res.status === 200) {
      return res.text();
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  })
  .then(body => {
    console.log('✅ Stream URL accessible!');
    console.log('First 200 chars:', body.substring(0, 200));
  })
  .catch(err => {
    console.log('❌ Stream URL failed:', err.message);
  });

// Test thumbnail URL
fetch(thumbnailUrl)
  .then(res => {
    console.log('✅ Thumbnail URL Status:', res.status);
    if (res.status === 200) {
      console.log('✅ Thumbnail URL accessible!');
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  })
  .catch(err => {
    console.log('❌ Thumbnail URL failed:', err.message);
  });
