import React from "react";
import "../../styles/Closet.css";

export default function AddItemModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-modal" onClick={onClose}>✖</button>
        <h2>Add New Item</h2>

        <form>
          <input type="text" placeholder="Item name" required />
          <select required>
            <option value="">Select category</option>
            <option value="Tops">Tops</option>
            <option value="Bottoms">Bottoms</option>
            <option value="Shoes">Shoes</option>
            <option value="Accessories">Accessories</option>
          </select>
          <input type="file" accept="image/*" required />
          <button type="submit">Add Item</button>
        </form>
      </div>
    </div>
  );
}
