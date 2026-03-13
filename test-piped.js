const getAudio = async () => {
  try {
    const res = await fetch("https://pipedapi.lunar.icu/streams/XRkJfxgdxzM");
    const json = await res.json();
    console.log(json.audioStreams?.length);
    if(json.audioStreams) {
      console.log(json.audioStreams[0].url.substring(0, 100));
    } else {
      console.log(json);
    }
  } catch(e) { console.error(e.message); }
};
getAudio();