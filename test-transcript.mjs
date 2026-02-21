import { Innertube } from 'youtubei.js';

const yt = await Innertube.create();
const videoId = 'dQw4w9WgXcQ';

console.log('Getting video info...');
const info = await yt.getInfo(videoId);
console.log('Title:', info.basic_info.title);
console.log('Has captions:', !!info.captions);

if (info.captions) {
  const tracks = info.captions.caption_tracks;
  console.log('Caption tracks:', tracks?.length);
  if (tracks) {
    for (const t of tracks) {
      console.log(`  ${t.language_code}: ${t.base_url?.substring(0, 80)}`);
    }
    
    const enTrack = tracks.find(t => t.language_code === 'en') || tracks[0];
    if (enTrack?.base_url) {
      console.log('\nFetching transcript from base_url...');
      const res = await fetch(enTrack.base_url);
      const text = await res.text();
      console.log('Status:', res.status, 'Length:', text.length);
      if (text.length > 0) {
        console.log('Content:', text.substring(0, 500));
      } else {
        console.log('Empty response!');
      }
    }
  }
}

// Try actions.transcript
console.log('\nChecking for transcript actions...');
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(yt)).filter(m => m.toLowerCase().includes('transcript'));
console.log('Transcript methods on yt:', methods);

// Try getBasicInfo
const basic = await yt.getBasicInfo(videoId);
console.log('\nBasic captions:', !!basic.captions);
if (basic.captions?.caption_tracks) {
  console.log('Basic caption tracks:', basic.captions.caption_tracks.length);
}
