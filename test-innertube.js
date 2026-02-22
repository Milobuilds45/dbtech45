import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  const videoId = 'TitZV6k8zfA';
  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const info = await yt.getInfo(videoId);
    
    console.log('Got info');
    const transcriptData = await info.getTranscript();
    console.log('Got transcript', transcriptData?.transcript?.content?.body?.initial_segments?.length);
    if (transcriptData && transcriptData.transcript) {
        const segments = transcriptData.transcript.content.body.initial_segments.map(s => s.snippet.text);
        console.log(segments.slice(0, 5));
    }
  } catch (err) {
    console.error('[captions] Error:', err);
  }
}
test();