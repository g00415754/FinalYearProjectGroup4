// -------------------------------------------------------------
// AddItemModal.jsx — Thryft Closet v2
// -------------------------------------------------------------

import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "../../firebase";

// ⭐ UPDATED — now imports URL-based dominant colour detector
import { detectDominantColorFromURL } from "./ColorDetection";

import inferSeasonFromData from "./SeasonalSorter";

export default function AddItemModal({
  show,
  onHide,
  currentUser,
  customCategories,
}) {
  const [form, setForm] = useState({
    name: "",
    category: "Tops",
    image: null,
    notes: "",
    fabric: "",
    price: "",
  });

  const [isUploading, setIsUploading] = useState(false);

  const closeModal = () => {
    setForm({
      name: "",
      category: "Tops",
      image: null,
      notes: "",
      fabric: "",
      price: "",
    });
    onHide();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.name || !form.image) return;

    try {
      setIsUploading(true);

      // -------------------------------------------------------------
      // 1. Upload image to Firebase Storage
      // -------------------------------------------------------------
      const imgRef = ref(
        storage,
        `users/${currentUser.uid}/closet/${Date.now()}_${form.image.name}`
      );

      await uploadBytes(imgRef, form.image);
      const imageUrl = await getDownloadURL(imgRef);

      // -------------------------------------------------------------
      // 2. Detect dominant colour FROM URL instead of File
      // ⭐ THIS IS THE FIX
      // -------------------------------------------------------------
      const colorTag = await detectDominantColorFromURL(imageUrl);

      // 3. Assign season based on category + colour
      const seasonTag = inferSeasonFromData(form.category, colorTag);

      // -------------------------------------------------------------
      // 4. Save to Firestore
      // -------------------------------------------------------------
      await addDoc(collection(db, "users", currentUser.uid, "closet"), {
        name: form.name,
        category: form.category,
        image: imageUrl,
        notes: form.notes || "",
        fabric: form.fabric || "",
        price: form.price || "",
        favorite: false,
        timesWorn: 0,
        lastWorn: null,
        colorTag,       // ⭐ accurate now
        seasonTag,
        createdAt: Timestamp.now(),
      });

      closeModal();
    } catch (err) {
      console.error("Error adding item:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal show={show} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Item</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* NAME */}
        <Form.Group className="mb-3">
          <Form.Label>Item Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="e.g. Cream Knit Sweater"
            value={form.name}
            onChange={handleChange}
          />
        </Form.Group>

        {/* CATEGORY */}
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option>Tops</option>
            <option>Bottoms</option>
            <option>Shoes</option>
            <option>Accessories</option>

            {customCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* IMAGE */}
        <Form.Group className="mb-3">
          <Form.Label>Item Photo</Form.Label>
          <input type="file" className="form-control" onChange={handleFileChange} />

          {form.image && (
            <img
              src={URL.createObjectURL(form.image)}
              alt="Preview"
              className="rounded mt-3 w-100 h-56 object-cover shadow"
            />
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fabric (optional)</Form.Label>
          <Form.Control
            type="text"
            name="fabric"
            placeholder="e.g. Cotton, Denim, Wool"
            value={form.fabric}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Notes (optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="notes"
            placeholder="e.g. Hand wash only, goes well with beige pants"
            value={form.notes}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Price (optional)</Form.Label>
          <Form.Control
            type="number"
            name="price"
            placeholder="€"
            value={form.price}
            onChange={handleChange}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>
          Cancel
        </Button>

        <Button
          variant="success"
          disabled={!form.name || !form.image || isUploading}
          onClick={handleAdd}
        >
          {isUploading ? "Adding..." : "Add Item"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
