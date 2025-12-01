// -------------------------------------------------------------
// SeasonalSorter.js — Simplified but Smart Season Logic
// Uses: colour + category + pattern + fabric
// -------------------------------------------------------------

export default function inferSeasonFromData(
  category,
  colorTag = "",
  patternTag = "",
  fabric = ""
) {
  const color = (colorTag || "").toLowerCase();
  const pattern = (patternTag || "").toLowerCase();
  const cat = (category || "").toLowerCase();
  const fab = (fabric || "").toLowerCase();

  // 1) STRONG FABRIC SIGNALS
  if (fab.includes("wool") || fab.includes("fleece") || fab.includes("cashmere"))
    return "Winter";

  if (fab.includes("linen"))
    return "Summer";

  if (fab.includes("denim"))
    return "All Year";

  if (fab.includes("leather") || fab.includes("suede"))
    return "Autumn";

  if (fab.includes("knit") || fab.includes("knitted"))
    return "Autumn";

  // 2) PATTERN HINTS
  if (pattern.includes("floral"))
    return "Spring";

  if (pattern.includes("plaid") || pattern.includes("check"))
    return "Autumn";

  if (pattern.includes("graphic"))
    return "Summer";

  // 3) COLOUR HINTS (based on our fashion colour strings)
  // Pastels / brights → Spring / Summer
  if (color.includes("pastel"))
    return "Spring";

  if (
    color.includes("light blue") ||
    color.includes("light pink") ||
    color.includes("yellow")
  ) {
    return "Spring";
  }

  if (
    color.includes("orange") ||
    color.includes("bright red") ||
    color.includes("bright yellow")
  ) {
    return "Summer";
  }

  // Dark / muted earth tones → Autumn / Winter
  if (
    color.includes("dark green") ||
    color.includes("olive") ||
    color.includes("brown") ||
    color.includes("burgundy")
  ) {
    return "Autumn";
  }

  if (
    color.includes("black") ||
    color.includes("navy") ||
    color.includes("dark") && color.includes("blue")
  ) {
    return "Winter";
  }

  // Beiges & creams & medium blues → very flexible
  if (
    color.includes("beige") ||
    color.includes("cream") ||
    color.includes("grey") ||
    color.includes("gray") ||
    color.includes("blue")
  ) {
    return "All Year";
  }

  // 4) CATEGORY HINTS (fallback)
  if (cat.includes("coat") || cat.includes("jacket") || cat.includes("puffer"))
    return "Winter";

  if (cat.includes("hoodie") || cat.includes("sweater") || cat.includes("jumper"))
    return "Autumn";

  if (cat.includes("shorts") || cat.includes("tank") || cat.includes("crop"))
    return "Summer";

  if (cat.includes("sandals"))
    return "Summer";

  if (cat.includes("boots"))
    return "Autumn";

  if (cat.includes("dress")) {
    if (pattern.includes("floral")) return "Spring";
    if (color.includes("dark")) return "Autumn";
  }

  // 5) Default if nothing matched
  return "All Year";
}
