const getCobalt = async () => {
  const res = await fetch("https://api.cobalt.tools/api/json", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: "https://www.youtube.com/watch?v=XRkJfxgdxzM",
      isAudioOnly: true
    })
  });
  const json = await res.json();
  console.log(json);
};
getCobalt();