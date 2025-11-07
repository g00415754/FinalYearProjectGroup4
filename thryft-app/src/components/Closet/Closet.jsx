import React, { useState } from "react";
import ClosetSection from "./ClosetSection";
import AddItemModal from "./AddItemModal";
import "../../styles/Closet.css";

export default function Closet() {
  const [showModal, setShowModal] = useState(false);

  // Sample static data (will be replaced with DB later)
  const closetData = {
    Tops: [
      { id: 1, name: "White T-Shirt", image: "/images/white-tshirt.jpg" },
      { id: 2, name: "Denim Jacket", image: "/images/denim-jacket.jpg" },
      { id: 3, name: "Graphic Tee", image: "/images/graphic-tee.jpg" },
      { id: 4, name: "Sweatshirt", image: "/images/sweatshirt.jpg" },
      { id: 5, name: "Crop Top", image: "/images/crop-top.jpg" },
    ],
    Bottoms: [
      { id: 6, name: "Blue Jeans", image: "/images/blue-jeans.jpg" },
      { id: 7, name: "Black Skirt", image: "/images/black-skirt.jpg" },
      { id: 8, name: "Joggers", image: "/images/joggers.jpg" },
      { id: 9, name: "Denim Shorts", image: "/images/denim-shorts.jpg" },
      { id: 10, name: "Cargo Pants", image: "/images/cargo-pants.jpg" },
    ],
    Shoes: [
      { id: 11, name: "Converse Sneakers", image: "/images/converse.jpg" },
      { id: 12, name: "Leather Boots", image: "/images/boots.jpg" },
      { id: 13, name: "Running Shoes", image: "/images/running-shoes.jpg" },
      { id: 14, name: "Slides", image: "/images/slides.jpg" },
      { id: 15, name: "Heels", image: "/images/heels.jpg" },
    ],
    Accessories: [
      { id: 16, name: "Gold Necklace", image: "/images/necklace.jpg" },
      { id: 17, name: "Bucket Hat", image: "/images/hat.jpg" },
      { id: 18, name: "Sunglasses", image: "/images/sunglasses.jpg" },
      { id: 19, name: "Watch", image: "/images/watch.jpg" },
      { id: 20, name: "Scarf", image: "/images/scarf.jpg" },
    ],
  };

  return (
    <div className="closet-page">
      <h1 className="closet-title">My Closet</h1>

      {Object.entries(closetData).map(([category, items]) => (
        <ClosetSection key={category} category={category} items={items} />
      ))}

      <button className="add-item-btn" onClick={() => setShowModal(true)}>
        + Add New Item
      </button>

      {showModal && <AddItemModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
