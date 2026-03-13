import { Innertube, UniversalCache } from 'youtubei.js';

async function testAudio() {
  try {
    console.log('Creating Innertube client...');
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    console.log('Downloading audio...');
    const stream = await yt.download('XRkJfxgdxzM', {
      type: 'audio',
      quality: 'bestefficiency',
      format: 'mp4'
    });
    
    let totalSize = 0;
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalSize += value.length;
    }
    console.log(`Successfully downloaded ${totalSize} bytes of audio!`);
  } catch(e) {
    console.error('Error:', e.message);
  }
}
testAudio();