// -------------------------------------------------------------
// DOMINANT COLOUR DETECTION FROM IMAGE URL
// -------------------------------------------------------------
export async function detectDominantColorFromURL(imageUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Required for Firebase URLs
      img.src = imageUrl;
  
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
  
        canvas.width = img.width;
        canvas.height = img.height;
  
        ctx.drawImage(img, 0, 0);
  
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
        const pixels = [];
  
        for (let i = 0; i < data.length; i += 200) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
  
          // Ignore near-white or near-black backgrounds
          if (r > 240 && g > 240 && b > 240) continue;
          if (r < 20 && g < 20 && b < 20) continue;
  
          pixels.push([r, g, b]);
        }
  
        if (pixels.length === 0) return resolve("Neutral");
  
        // bucket clustering
        const bucketCounts = {};
        const bucketSize = 32;
  
        for (const [r, g, b] of pixels) {
          const key = [
            Math.floor(r / bucketSize),
            Math.floor(g / bucketSize),
            Math.floor(b / bucketSize),
          ].join(",");
          bucketCounts[key] = (bucketCounts[key] || 0) + 1;
        }
  
        const dominantBucket = Object.entries(bucketCounts).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0];
  
        const [rB, gB, bB] = dominantBucket
          .split(",")
          .map((v) => parseInt(v) * bucketSize + bucketSize / 2);
  
        resolve(mapRGBtoFashionColour(rB, gB, bB));
      };
  
      img.onerror = () => resolve("Neutral");
    });
  }
  