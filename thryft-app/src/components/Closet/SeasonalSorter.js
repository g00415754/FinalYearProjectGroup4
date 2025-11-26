export default function inferSeasonFromData(category, colour) {
    const cat = category.toLowerCase();
    const col = colour.toLowerCase();
  
    if (cat.includes("coat") || col === "black" || col === "neutral")
      return "Winter";
  
    if (col === "yellow" || col === "pink" || col === "green")
      return "Spring";
  
    if (cat.includes("dress") || col === "white" || col === "blue")
      return "Summer";
  
    if (col === "brown" || col === "beige")
      return "Autumn";
  
    return "All";
  }
  