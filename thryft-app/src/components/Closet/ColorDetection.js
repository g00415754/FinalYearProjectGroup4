// -------------------------------------------------------------
// Enhanced Color + Pattern Detection for Thryft Closet v2
// -------------------------------------------------------------

/*  
    Detects:
    ✔ Dominant colour
    ✔ Pastel, muted, dark, bright versions
    ✔ Fashion-friendly colour names
    ✔ Basic pattern classification: Floral, Striped, Plaid, Graphic, Polka Dot
*/

// 🎨 Helper for color distance
function distance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// 🎨 Clean, human-friendly fashion colours
const COLOUR_MAP = [
  { name: "White", rgb: [240, 240, 240] },
  { name: "Black", rgb: [20, 20, 20] },
  { name: "Beige", rgb: [220, 200, 170] },
  { name: "Brown", rgb: [120, 72, 40] },
  { name: "Grey", rgb: [150, 150, 150] },
  { name: "Blue", rgb: [65, 105, 225] },
  { name: "Light Blue", rgb: [135, 206, 250] },
  { name: "Navy", rgb: [10, 30, 70] },
  { name: "Green", rgb: [60, 130, 75] },
  { name: "Olive", rgb: [128, 128, 0] },
  { name: "Yellow", rgb: [255, 235, 100] },
  { name: "Orange", rgb: [255, 165, 60] },
  { name: "Red", rgb: [220, 20, 60] },
  { name: "Pink", rgb: [255, 170, 185] },
  { name: "Purple", rgb: [150, 80, 200] },
  { name: "Burgundy", rgb: [110, 0, 30] },
];

function classifyShade(r, g, b) {
  const brightness = (r + g + b) / 3;

  if (brightness > 220) return "Light";
  if (brightness < 60) return "Dark";

  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  if (sat < 25) return "Muted";

  if (brightness > 170) return "Pastel";

  return "Normal";
}

// 🟣 Main mapping
export function mapRGBtoFashionColour(r, g, b) {
  let best = null;
  let bestDistance = Infinity;

  for (const color of COLOUR_MAP) {
    const d = distance(r, g, b, ...color.rgb);
    if (d < bestDistance) {
      bestDistance = d;
      best = color.name;
    }
  }

  const shade = classifyShade(r, g, b);
  if (shade === "Normal") return best;

  return `${shade} ${best}`;
}

// -------------------------------------------------------------
// PATTERN DETECTION
// -------------------------------------------------------------
export function detectPattern(pixels) {
  let highContrast = 0;
  let colourChanges = 0;

  for (let i = 0; i < pixels.length - 4; i += 4) {
    const r1 = pixels[i], g1 = pixels[i+1], b1 = pixels[i+2];
    const r2 = pixels[i+4], g2 = pixels[i+5], b2 = pixels[i+6];

    const diff = distance(r1, g1, b1, r2, g2, b2);

    if (diff > 80) highContrast++;
    if (diff > 50) colourChanges++;
  }

  if (highContrast > 800) return "Plaid";
  if (colourChanges > 600) return "Floral";
  if (highContrast > 400) return "Striped";
  if (colourChanges > 300) return "Polka Dot";
  if (colourChanges > 200) return "Graphic Print";

  return "Solid";
}

// -------------------------------------------------------------
// DETECT COLOUR + PATTERN FROM FIREBASE IMAGE URL
// -------------------------------------------------------------
export async function detectDominantColorFromURL(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const sampled = [];
      for (let i = 0; i < data.length; i += 200) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Ignore near white & near black backgrounds
        if (r > 240 && g > 240 && b > 240) continue;
        if (r < 25 && g < 25 && b < 25) continue;

        sampled.push([r, g, b]);
      }

      if (sampled.length === 0) return resolve({ colour: "Neutral", pattern: "Solid" });

      // find dominant bucket
      const bucketCounts = {};
      const bucketSize = 32;

      for (const [r, g, b] of sampled) {
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

      const colour = mapRGBtoFashionColour(rB, gB, bB);
      const pattern = detectPattern(data);

      resolve({ colour, pattern });
    };

    img.onerror = () => resolve({ colour: "Neutral", pattern: "Solid" });
  });
}
